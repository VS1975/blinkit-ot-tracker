import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Check for admin session
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all OT entries
    const entriesRef = collection(db, 'ot_entries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    const entries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || null,
    }));

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching OT entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OT entries' },
      { status: 500 }
    );
  }
}
