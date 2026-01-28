import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value: File | null
    onChange: (file: File | null) => void
    currentImage?: string | null
    accept?: string
    maxSize?: number
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    currentImage,
    accept = 'image/jpeg,image/jpg,image/png,image/webp',
    maxSize = 2048, // KB
    className,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCurrentImageRemoved, setIsCurrentImageRemoved] = useState(false)

    const validateFile = (file: File): boolean => {
        const acceptedTypes = accept.split(',').map((t) => t.trim())
        const fileType = file.type

        if (!acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type)
            }
            return fileType === type
        })) {
            setError('Format file tidak didukung')
            return false
        }

        const fileSizeKB = file.size / 1024
        if (fileSizeKB > maxSize) {
            setError(`Ukuran file maksimal ${maxSize / 1024}MB`)
            return false
        }

        setError(null)
        return true
    }

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            onChange(file)
            setIsCurrentImageRemoved(false) // Reset removed state when uploading new file
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragOver(false)

            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) {
                handleFile(files[0])
            }
        },
        [accept, maxSize]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFile(files[0])
        }
    }

    const handleClear = () => {
        onChange(null)
        setPreview(null)
        setError(null)
        setIsCurrentImageRemoved(true) // Mark current image as removed
    }

    const displayImage = preview || (currentImage && !isCurrentImageRemoved ? `/storage/${currentImage}` : null)

    return (
        <div className={cn('space-y-3', className)}>
            {displayImage ? (
                <div className="relative">
                    <div className="relative overflow-hidden rounded-lg border bg-muted">
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="h-64 w-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-colors hover:bg-destructive/90"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {currentImage && !preview && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            Gambar saat ini • Klik X untuk menghapus atau upload gambar baru
                        </div>
                    )}
                    {preview && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            Preview gambar baru • Klik X untuk membatalkan
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                        isDragOver
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                        error && 'border-destructive'
                    )}
                >
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            {isDragOver ? (
                                <Upload className="h-6 w-6 text-primary" />
                            ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {isDragOver
                                    ? 'Lepaskan file di sini'
                                    : 'Drag & drop gambar atau klik untuk memilih'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Format: JPG, PNG, WEBP • Maksimal: {maxSize / 1024}MB
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        className="absolute inset-0 cursor-pointer opacity-0"
                    />
                </div>
            )}
            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    )
}
