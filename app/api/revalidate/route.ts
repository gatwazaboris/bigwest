import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/gallery', '/contact', '/tours/boat', '/tours/island', '/tours/hiking', '/tours/water', '/account', '/account/profile'];

export async function POST() {
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path);
  }
  revalidatePath('/', 'layout');
  revalidatePath('/tour', 'layout');
  revalidatePath('/tours', 'layout');
  revalidatePath('/account');

  return NextResponse.json({ ok: true, revalidated: true });
}
