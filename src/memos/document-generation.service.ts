import { Injectable } from '@nestjs/common';
import { Memo } from './entities/memo.entity';

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  date: Date;
  signature: string;
  department: string;
  memoNumber: string;
}

@Injectable()
export class DocumentGenerationService {
  
  /**
   * Generate a formatted document from an approved memo
   */
  async generateDocument(memo: Memo): Promise<DocumentData> {
    // Generate memo number based on date and ID
    const year = memo?.date_of_issue ? new Date(memo?.date_of_issue)?.getFullYear() : new Date().getFullYear();
    const month = String(memo?.date_of_issue ? new Date(memo?.date_of_issue)?.getMonth() + 1 : new Date().getMonth() + 1).padStart(2, '0');
    const memoNumber = `MSLEO/${year}/${month}/${memo?.id?.slice(-6).toUpperCase()}`;
    
    return {
      id: memo.id,
      title: memo.title,
      content: memo.body ?? '',
      date: memo.date_of_issue ?? new Date(),
      signature: memo.signature ?? '',
      department: memo.department ?? '',
      memoNumber: memoNumber
    };
  }

  /**
   * Generate HTML template for the document
   */
  generateDocumentHTML(documentData: DocumentData): string {
    const formattedDate = new Date(documentData.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Office Memo - ${documentData.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            align-items: center;
            padding: 20px;
            border-bottom: 2px solid #333;
        }
        .logo-section {
            display: flex;
            align-items: center;
            flex: 1;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: #4a90e2;
            border-radius: 50%;
            margin-right: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        }
        .org-info {
            flex: 1;
            text-align: center;
        }
        .org-info h1 {
            margin: 0;
            font-size: 16px;
            color: #333;
        }
        .org-info h2 {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .msleo-logo {
            width: 60px;
            height: 60px;
            background: #e74c3c;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
        }
        .memo-header {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
        }
        .memo-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            color: #333;
        }
        .memo-subtitle {
            font-size: 16px;
            color: #666;
            margin: 5px 0 0 0;
        }
        .memo-meta {
            display: flex;
            justify-content: space-between;
            padding: 15px 20px;
            background: #f9f9f9;
            border-bottom: 1px solid #ddd;
        }
        .memo-number {
            font-weight: bold;
            color: #333;
        }
        .memo-date {
            color: #666;
        }
        .memo-content {
            padding: 40px;
            min-height: 400px;
            line-height: 1.6;
            color: #333;
        }
        .signature-section {
            padding: 20px 40px;
            border-top: 1px solid #ddd;
            text-align: right;
        }
        .signature-line {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #333;
            width: 200px;
            margin-left: auto;
            text-align: center;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .document-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="logo">
                🌍
            </div>
            <div class="org-info">
                <h1>ሚዲካል አገልግሎት መሪ ቢሮ አስቤዎዎች</h1>
                <h2>Medical Service Lead Executive Office</h2>
            </div>
            <div class="msleo-logo">
                M
            </div>
        </div>
        
        <div class="memo-header">
            <div class="memo-meta">
                <div class="memo-number">${documentData.memoNumber}</div>
                <div class="memo-date">${formattedDate}</div>
            </div>
            <h1 class="memo-title">የቤሮ ማስታወሻ</h1>
            <h2 class="memo-subtitle">Office Memo</h2>
        </div>
        
        <div class="memo-content">
            ${documentData.content}
        </div>
        
        <div class="signature-section">
            <div class="signature-line">
                ${documentData.signature}<br>
                ፊርማ / Signature
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate a simple text template for API responses
   */
  generateDocumentTemplate(documentData: DocumentData): any {
    return {
      documentId: documentData.id,
      memoNumber: documentData.memoNumber,
      title: documentData.title,
      content: documentData.content,
      date: documentData.date,
      signature: documentData.signature,
      department: documentData.department,
      template: 'office_memo_template',
      generatedAt: new Date()
    };
  }
} 