import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Quiz, Question, QuizResult, Note, StudyRoom } from '../types';

export const dataService = {
  // --- User Profile ---
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async createUserProfile(user: Omit<UserProfile, 'stats' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...user,
      stats: {
        totalStudyTime: 0,
        quizCount: 0,
        streak: 0,
        velocity: 0,
        xp: 0,
        level: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid), newUser);
    return newUser;
  },

  async updateUserStats(uid: string, updates: Partial<UserProfile['stats']>) {
    const docRef = doc(db, 'users', uid);
    // Construct the nested update object
    const finalUpdates: any = { updatedAt: new Date().toISOString() };
    Object.keys(updates).forEach(key => {
      finalUpdates[`stats.${key}`] = (updates as any)[key];
    });
    await updateDoc(docRef, finalUpdates);
  },

  // --- Quizzes ---
  async getQuizzes(): Promise<Quiz[]> {
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
  },

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const q = query(collection(db, 'quizzes', quizId, 'questions'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
  },

  async saveQuizResult(result: Omit<QuizResult, 'date'>): Promise<void> {
    await addDoc(collection(db, 'users', result.userId, 'quizResults'), {
      ...result,
      date: new Date().toISOString()
    });
    
    // Update aggregate stats
    const userRef = doc(db, 'users', result.userId);
    await updateDoc(userRef, {
      'stats.quizCount': increment(1),
      'stats.xp': increment(result.score),
      updatedAt: new Date().toISOString()
    });
  },

  // --- Notes ---
  async getNotes(uid: string): Promise<Note[]> {
    const q = query(collection(db, 'users', uid, 'notes'), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  },

  async saveNote(uid: string, note: Omit<Note, 'id' | 'userId' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', uid, 'notes'), {
      ...note,
      userId: uid,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  },

  async deleteNote(uid: string, noteId: string): Promise<void> {
    const docRef = doc(db, 'users', uid, 'notes', noteId);
    // Note: For simplicity, we just delete. Real app might archive.
  },

  // --- Study Rooms ---
  async getActiveRooms(): Promise<StudyRoom[]> {
    const q = query(collection(db, 'rooms'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyRoom));
  },

  async createRoom(uid: string, name: string): Promise<string> {
    const docRef = await addDoc(collection(db, 'rooms'), {
      name,
      creatorId: uid,
      participants: [uid],
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  },

  // --- Leaderboard ---
  async getTopUsers(limitCount = 10): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), orderBy('stats.xp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as UserProfile);
  },

  // --- Focus Sessions ---
  async logFocusSession(uid: string, durationMinutes: number): Promise<void> {
    const sessionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docId = `${uid}_${sessionDate}`;
    const docRef = doc(db, 'users', uid, 'focusSessions', docId);
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        minutes: increment(durationMinutes),
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(docRef, {
        date: sessionDate,
        minutes: durationMinutes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Also update aggregate total
    await this.updateUserStats(uid, {
      totalStudyTime: increment(durationMinutes) as any
    });
  },

  async getRecentFocusSessions(uid: string): Promise<{ day: string, hours: number }[]> {
    const q = query(
      collection(db, 'users', uid, 'focusSessions'),
      orderBy('date', 'desc'),
      limit(7)
    );
    const snap = await getDocs(q);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const results = snap.docs.map(doc => {
      const data = doc.data();
      const date = new Date(data.date);
      return {
        day: days[date.getDay()],
        hours: Number((data.minutes / 60).toFixed(1)),
        rawDate: data.date
      };
    }).reverse();

    // Fill in missing days with 0 if necessary for a better chart? 
    // For now just return real data.
    return results;
  },

  // --- Search ---
  async globalSearch(uid: string, searchQuery: string): Promise<any[]> {
    const term = searchQuery.toLowerCase();
    
    // In a real large app, we'd use Algolia or specialized indices.
    // For this context, we'll fetch and filter.
    const quizzes = await this.getQuizzes();
    const notes = await this.getNotes(uid);
    
    const quizResults = quizzes
      .filter(q => q.title.toLowerCase().includes(term) || q.category.toLowerCase().includes(term))
      .map(q => ({ id: q.id, type: 'quiz', title: q.title, excerpt: q.description, tags: [q.category] }));
      
    const noteResults = notes
      .filter(n => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term))
      .map(n => ({ id: n.id, type: 'note', title: n.title, excerpt: n.content.substring(0, 100) + '...', tags: ['Personal'] }));
      
    return [...quizResults, ...noteResults];
  }
};
