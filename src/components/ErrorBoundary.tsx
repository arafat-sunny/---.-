import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let readable = 'অপ্রত্যাশিত একটি কারিগরি ত্রুটি ঘটেছে। অনুগ্রহ করে পৃষ্ঠাটি পুনরায় লোড করুন।';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (parsed.error.includes('permission') || parsed.error.includes('Missing or insufficient')) {
          readable = 'এই তথ্যটি দেখার বা পরিবর্তনের অনুমতি আপনার অ্যাকাউন্টে নেই। অনুগ্রহ করে লগইন অথবা অ্যাডমিন অনুমোদন যাচাই করুন।';
        } else if (parsed.error.includes('Quota exceeded')) {
          readable = 'ডেটাবেজের দৈনিক সীমা অতিক্রম করেছে। আগামীকাল পুনরায় চালু হবে।';
        } else {
          readable = parsed.error;
        }
      }
    } catch {
      if (error.message) readable = error.message;
    }
    return { hasError: true, errorMessage: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E4DFD2] rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0B3B28] mb-2">দুঃখিত, একটি সমস্যা হয়েছে</h2>
            <p className="text-sm text-[#4A5951] leading-relaxed mb-6">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D4A32] text-white text-sm font-medium rounded-lg hover:bg-[#093624] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
