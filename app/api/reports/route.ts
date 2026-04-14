// app/api/reports/route.ts
// Report generation and management API

import { NextResponse } from 'next/server';
import { generateReport, getReport, listReports, listAllReports, deleteReport } from '@/lib/report-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      datasetId, 
      datasetName, 
      visibility = 'private',
      includePredictions = true,
      includeAlerts = true,
      timezone,
      timezoneOffset,
      ...analysisData 
    } = body;
    
    console.log('[REPORTS POST] Received request:', { datasetId, datasetName, visibility });
    
    if (!datasetId || !datasetName) {
      return NextResponse.json(
        { error: 'datasetId and datasetName are required' },
        { status: 400 }
      );
    }
    
    const report = await generateReport(
      datasetId,
      datasetName,
      { visibility, includePredictions, includeAlerts, timezone, timezoneOffset },
      analysisData
    );
    
    console.log('[REPORTS POST] Generated report:', report.id);
    
    return NextResponse.json({
      success: true,
      reportId: report.id,
      shareableLink: `/report/${report.id}`,
      visibility: report.visibility,
      createdAt: report.createdAt,
      localTime: report.localTime,
      timezone: report.timezone
    });
    
  } catch (error: any) {
    console.error('[REPORTS POST] Error:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const datasetId = searchParams.get('datasetId');
  const listAll = searchParams.get('list');
  
  console.log('[REPORTS API] GET called with:', { datasetId, listAll });
  
  // If list=true, return all reports
  if (listAll === 'true') {
    try {
      const reports = listAllReports(); // Get all reports
      console.log('[REPORTS API] Returning all reports:', reports.length);
      return NextResponse.json({ reports });
    } catch (err) {
      console.error('[REPORTS API] Error listing reports:', err);
      return NextResponse.json({ reports: [], error: 'Failed to load reports' }, { status: 500 });
    }
  }
  
  if (datasetId) {
    const reports = listReports(datasetId);
    return NextResponse.json({ reports });
  }
  
  return NextResponse.json({ error: 'datasetId required' }, { status: 400 });
}
