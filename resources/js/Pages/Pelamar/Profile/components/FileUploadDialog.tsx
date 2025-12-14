import { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Upload, FileText, Image, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelect: (file: File) => void;
    currentFileName?: string | null;
    currentFileUrl?: string | null;
    disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUploadDialog({
    open,
    onOpenChange,
    onFileSelect,
    currentFileName,
    currentFileUrl,
    disabled = false,
}: FileUploadDialogProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Format file tidak valid', {
                description: 'File harus berformat JPG, JPEG, PNG, atau PDF',
            });
            return false;
        }
        if (file.size > MAX_SIZE) {
            toast.error('Ukuran file terlalu besar', {
                description: 'Ukuran file maksimal 5MB',
            });
            return false;
        }
        return true;
    };

    const handleFile = useCallback((file: File) => {
        if (!validateFile(file)) return;

        setPreviewFile(file);

        // Create preview URL for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [disabled, handleFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleConfirm = () => {
        if (previewFile) {
            onFileSelect(previewFile);
            toast.success('File berhasil dipilih');
            handleClose();
        }
    };

    const handleClose = () => {
        // Cleanup preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
        onOpenChange(false);
    };

    const handleRemovePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    const getFileIcon = (file: File | null, isPdf: boolean) => {
        if (isPdf) {
            return <FileText className="h-12 w-12 text-red-500" />;
        }
        return <Image className="h-12 w-12 text-blue-500" />;
    };

    const isPdf = previewFile?.type === 'application/pdf';
    const hasExistingFile = currentFileName && currentFileUrl;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload File Sertifikat</DialogTitle>
                    <DialogDescription>
                        Seret dan lepas file atau klik untuk memilih. Format: JPG, PNG, PDF (maks. 5MB)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Existing File Info */}
                    {hasExistingFile && !previewFile && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm font-medium text-green-800 mb-2">File Saat Ini:</p>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                <a
                                    href={currentFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-700 hover:text-green-900 underline truncate max-w-[200px]"
                                >
                                    {currentFileName}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                            transition-all duration-200
                            ${isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={disabled}
                        />

                        {previewFile ? (
                            <div className="space-y-3">
                                {/* Preview */}
                                <div className="flex justify-center">
                                    {previewUrl && !isPdf ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                    ) : (
                                        getFileIcon(previewFile, isPdf)
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-full">
                                        {previewFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(previewFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePreview();
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Hapus
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {isDragging ? 'Lepas file di sini' : 'Seret file ke sini'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        atau klik untuk memilih file
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!previewFile || disabled}
                            className="bg-blue-900 hover:bg-blue-800"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Pilih File
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
