import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface CustomerProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  firstSeen: Timestamp | any;
  lastSeen: Timestamp | any;
  loginCount: number;
  orderCount: number;
  totalSpent: number;
}

export const CustomerService = {
  // Called every time a user signs in — creates or updates their record
  async upsertCustomer(user: User): Promise<void> {
    try {
      const ref = doc(db, 'customers', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        // Update last seen and login count
        await setDoc(
          ref,
          {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastSeen: serverTimestamp(),
            loginCount: (snap.data().loginCount || 0) + 1,
          },
          { merge: true }
        );
      } else {
        // First time this customer logs in — create full record
        await setDoc(ref, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          firstSeen: serverTimestamp(),
          lastSeen: serverTimestamp(),
          loginCount: 1,
          orderCount: 0,
          totalSpent: 0,
        });
      }
    } catch (error) {
      console.error('CustomerService.upsertCustomer error:', error);
    }
  },

  // Fetch all customers for the Admin CRM tab
  async getAllCustomers(): Promise<CustomerProfile[]> {
    try {
      const q = query(collection(db, 'customers'), orderBy('lastSeen', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })) as CustomerProfile[];
    } catch (error) {
      console.error('CustomerService.getAllCustomers error:', error);
      return [];
    }
  },
};
