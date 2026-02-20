import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobTitle = formData.get('jobTitle') as string;
    const userId = formData.get('userId') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const experience = formData.get('experience') as string;
    const skills = formData.get('skills') as string;
    const education = formData.get('education') as string;
    const location = formData.get('location') as string;
    const currentRole = formData.get('currentRole') as string;
    const expectedSalary = formData.get('expectedSalary') as string;

    if (!file || !jobTitle || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Primary backend payload (/api/v1/user/apply)
    const v1FormData = new FormData();
    v1FormData.append('user_id', userId);
    v1FormData.append('job_title', jobTitle);
    v1FormData.append('file_name', file.name);
    v1FormData.append('name', name);
    v1FormData.append('email', email);
    v1FormData.append('phone', phone);
    v1FormData.append('age', age);
    v1FormData.append('gender', gender);
    v1FormData.append('experience', experience);
    v1FormData.append('skills', skills);
    v1FormData.append('education', education);
    v1FormData.append('location', location);
    v1FormData.append('current_role', currentRole);
    v1FormData.append('expected_salary', expectedSalary);

    // Fallback payload (/api/user/apply)
    const legacyFormData = new FormData();
    legacyFormData.append('file', file);
    legacyFormData.append('jobTitle', jobTitle);
    legacyFormData.append('userId', userId);
    legacyFormData.append('name', name);
    legacyFormData.append('email', email);
    legacyFormData.append('phone', phone);
    legacyFormData.append('age', age);
    legacyFormData.append('gender', gender);
    legacyFormData.append('experience', experience);
    legacyFormData.append('skills', skills);
    legacyFormData.append('education', education);
    legacyFormData.append('location', location);
    legacyFormData.append('currentRole', currentRole);
    legacyFormData.append('expectedSalary', expectedSalary);

    let lastError = 'Backend request failed';

    try {
      const v1Response = await fetch('http://localhost:8000/api/v1/user/apply', {
        method: 'POST',
        body: v1FormData,
      });

      if (v1Response.ok) {
        const data = await v1Response.json();
        return NextResponse.json({ success: true, application: data });
      }
      const v1Err = await v1Response.text();
      lastError = `/api/v1/user/apply failed: ${v1Response.status} ${v1Err}`;
    } catch (backendError: any) {
      lastError = `/api/v1/user/apply error: ${backendError?.message || String(backendError)}`;
    }

    try {
      const legacyResponse = await fetch('http://localhost:8000/api/user/apply', {
        method: 'POST',
        body: legacyFormData,
      });

      if (legacyResponse.ok) {
        const data = await legacyResponse.json();
        if (data?.success) {
          return NextResponse.json({ success: true, application: data });
        }
      }
      const legacyErr = await legacyResponse.text();
      lastError = `/api/user/apply failed: ${legacyResponse.status} ${legacyErr}`;
    } catch (backendError: any) {
      lastError = `/api/user/apply error: ${backendError?.message || String(backendError)}`;
    }

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
