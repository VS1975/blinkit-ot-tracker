import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { captainId, captainName, purpose, otEntry } = body;

    // Validate required fields
    if (!captainId || !captainName || !purpose || !otEntry) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes = ['PUTAWAY', 'PICKING', 'AUDIT'];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      );
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'ot_entries'), {
      captainId,
      captainName,
      purpose,
      otEntry,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        message: 'OT entry submitted successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting OT entry:', error);
    return NextResponse.json(
      { error: 'Failed to submit OT entry' },
      { status: 500 }
    );
  }
}
