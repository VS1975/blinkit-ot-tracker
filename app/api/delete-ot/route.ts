import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Check for admin session
    const session = request.cookies.get('admin_session');
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the document
    await deleteDoc(doc(db, 'ot_entries', id));

    return NextResponse.json(
      { success: true, message: 'OT entry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting OT entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete OT entry' },
      { status: 500 }
    );
  }
}
