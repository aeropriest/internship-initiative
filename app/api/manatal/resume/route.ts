import { NextRequest, NextResponse } from 'next/server';
import { MANATAL_API_TOKEN } from '../../../../config';

async function uploadDocumentToManatal(candidateId: number, file: File): Promise<any> {
  console.log(`📎 Manatal: Uploading document ${file.name} for candidate ${candidateId}`);
  
  if (!MANATAL_API_TOKEN) {
    throw new Error('NEXT_PUBLIC_MANATAL_API_TOKEN environment variable is not set');
  }

  // Convert file to base64 for Manatal API
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  
  const documentData = {
    candidate: candidateId,
    name: file.name,
    document_type: file.name.toLowerCase().includes('cv') || file.name.toLowerCase().includes('resume') ? 'resume' : 'other',
    file_content: base64,
    file_name: file.name,
    content_type: file.type
  };

  console.log('📤 Manatal: Uploading document with base64 content...');
  console.log(`   📄 File: ${file.name} (${file.size} bytes)`);
  console.log(`   📋 Type: ${documentData.document_type}`);

  const startTime = Date.now();
  // Use the resume-specific endpoint that worked in our earlier tests
  const response = await fetch(`https://api.manatal.com/open/v3/candidates/${candidateId}/resume/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${MANATAL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  });

  const endTime = Date.now();
  console.log(`⏱️ Manatal: Document upload completed in ${endTime - startTime}ms`);

  const responseText = await response.text();
  console.log(`📊 Manatal: Document upload response status: ${response.status}`);
  console.log('📥 Manatal: Document upload response:', responseText);

  if (!response.ok) {
    console.error(`❌ Manatal: Document upload failed with status ${response.status}`);
    throw new Error(`Manatal document upload error: ${response.status} - ${responseText}`);
  }

  try {
    const parsedResponse = JSON.parse(responseText);
    console.log('✅ Manatal: Document uploaded successfully');
    return parsedResponse;
  } catch (parseError) {
    console.error('❌ Manatal: Failed to parse document upload response:', parseError);
    throw new Error(`Failed to parse Manatal document response: ${responseText}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📎 Manatal Resume API: Received resume upload request');
    
    const formData = await request.formData();
    const candidateId = formData.get('candidateId') as string;
    const resumeFile = formData.get('resume') as File;

    console.log('📝 Manatal Resume API: Request data:');
    console.log(`   🆔 Candidate ID: ${candidateId}`);
    console.log(`   📄 Resume file: ${resumeFile?.name} (${resumeFile?.size} bytes)`);

    if (!candidateId || !resumeFile) {
      return NextResponse.json(
        { success: false, error: 'Missing candidateId or resume file' },
        { status: 400 }
      );
    }

    console.log('📤 Manatal Resume API: Uploading resume to Manatal...');
    const uploadResult = await uploadDocumentToManatal(parseInt(candidateId), resumeFile);
    console.log('✅ Manatal Resume API: Resume uploaded successfully:', uploadResult);
    
    const responseData = {
      success: true,
      upload: {
        id: uploadResult.id || Date.now(),
        candidate_id: parseInt(candidateId),
        file_name: resumeFile.name,
        file_url: uploadResult.file_url || uploadResult.url || '',
        upload_status: 'completed',
        document_type: 'resume',
        created_at: new Date().toISOString(),
      }
    };

    console.log('📤 Manatal Resume API: Sending response:', JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 Manatal Resume API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload resume. Please try again.',
      upload: null
    }, { status: 500 });
  }
}
