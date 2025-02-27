'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle2, AlertCircle, Briefcase, CreditCard, HomeIcon, Trash2, Home } from 'lucide-react';
import type { Document } from '../types/document';

type DocumentType = 'income' | 'identification' | 'credit' | 'rental';

const REQUIRED_DOCUMENTS: DocumentType[] = ['income', 'identification', 'credit', 'rental'];

function getDocumentStatus(documents: Document[]) {
  const verified = documents.filter(doc => doc.status === 'verified');
  const uploaded = documents.length;
  const missingTypes = REQUIRED_DOCUMENTS.filter(type => 
    !documents.some(doc => doc.document_type === type)
  );
  
  return {
    isComplete: uploaded === REQUIRED_DOCUMENTS.length,
    isVerified: verified.length === REQUIRED_DOCUMENTS.length,
    missingTypes,
    uploadedCount: uploaded,
    verifiedCount: verified.length,
    totalRequired: REQUIRED_DOCUMENTS.length
  };
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch('http://localhost:3001/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    try {
      setUploadingType(documentType);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('originalName', file.name);

      const response = await fetch('http://localhost:3001/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to upload document');
      }

      const newDocument = await response.json();
      setDocuments(prev => [...prev, newDocument]);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Document uploaded successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError((err as Error).message || 'Failed to upload document');
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (documentId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const documentStatus = getDocumentStatus(documents);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-800 pt-20">
      <div className="container mx-auto px-4">
        {/* Documents Section */}
        <div className="max-w-4xl mx-auto">
          {/* Add the CTA at the top if documents are verified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-xl shadow-xl ${
              documentStatus.isVerified 
                ? 'bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20'
                : 'bg-white/10 backdrop-blur-sm border border-white/20'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {documentStatus.isVerified ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <h2 className="text-xl font-semibold text-white">
                        Documents Verified!
                      </h2>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-xl font-semibold text-white">
                        Document Upload Required
                      </h2>
                    </>
                  )}
                </div>
                
                {documentStatus.isVerified ? (
                  <p className="text-cyan-200">
                    Your documents have been verified. You're ready to start browsing apartments!
                  </p>
                ) : (
                  <div>
                    <p className="text-cyan-200 mb-2">
                      Please upload all required documents to start browsing apartments:
                    </p>
                    {documentStatus.missingTypes.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        {documentStatus.missingTypes.map(type => (
                          <li key={type} className="capitalize">
                            {type.replace('_', ' ')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        documentStatus.isVerified
                          ? 'bg-gradient-to-r from-green-500 to-cyan-500'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                      }`}
                      style={{ width: `${(documentStatus.verifiedCount / documentStatus.totalRequired) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-cyan-200">
                    {documentStatus.verifiedCount}/{documentStatus.totalRequired} Verified
                  </span>
                </div>
              </div>

              <Link
                href="/saved-listings"
                className={`flex items-center px-6 py-3 rounded-lg transition-all transform 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                           ${documentStatus.isVerified
                             ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 hover:scale-105 focus:ring-green-500 shadow-lg shadow-green-500/20'
                             : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                           }`}
                onClick={e => !documentStatus.isVerified && e.preventDefault()}
                aria-disabled={!documentStatus.isVerified}
              >
                <Home className="w-5 h-5 mr-2" />
                {documentStatus.isVerified ? 'Start Applying' : 'Complete Upload to Start'}
              </Link>
            </div>
          </motion.div>

          {/* Your existing document upload and list sections */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-6">Document Center</h1>
            {/* Error Alert */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Document Upload Section */}
            <div className="grid grid-cols-1 gap-6">
              {[
                { type: 'income', name: 'Income Verification', icon: Briefcase },
                { type: 'identification', name: 'Identification', icon: FileText },
                { type: 'credit', name: 'Credit Report', icon: CreditCard },
                { type: 'rental', name: 'Rental History', icon: HomeIcon }
              ].map((docType) => (
                <motion.div
                  key={docType.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-white/5">
                        <docType.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{docType.name}</h3>
                        <p className="text-sm text-gray-300">
                          {documents.some(d => d.document_type === docType.type) 
                            ? 'Document uploaded' 
                            : 'No document uploaded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {documents
                        .filter(doc => doc.document_type === docType.type)
                        .map(doc => (
                          <div key={doc.id} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">
                              {formatFileSize(doc.file_size)}
                            </span>
                            {getStatusIcon(doc.status)}
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1 rounded-full hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      
                      <label className="cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 
                                    hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium
                                    transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                 {...(uploadingType === docType.type ? { disabled: true } : {})}
                      >
                        {uploadingType === docType.type ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(docType.type, e.target.files[0]);
                            }
                          }}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          disabled={uploadingType === docType.type}
                        />
                      </label>
                    </div>
                  </div>

                  {documents
                    .filter(doc => doc.document_type === docType.type && doc.status === 'rejected')
                    .map(doc => (
                      <div key={doc.id} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-200 text-sm">
                          Document rejected. Please upload a new version that meets our requirements.
                        </p>
                      </div>
                    ))}
                </motion.div>
              ))}
            </div>

            {/* Upload Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Document Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Documents Uploaded</span>
                  <span className="text-cyan-300">
                    {documents.length} / 4
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(documents.length / 4) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 