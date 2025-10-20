import React from 'react';

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'birthday-shoot.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="relative max-w-3xl max-h-[90vh] bg-gray-800 p-4 rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 text-white bg-gray-900 rounded-full p-2 hover:bg-pink-500 transition-colors z-10"
                    aria-label="Fermer"
                >
                    <CloseIcon />
                </button>
                <img src={imageUrl} alt="Aperçu" className="w-full h-full object-contain max-h-[calc(90vh-80px)] rounded" />
                <div className="mt-4 text-center">
                    <button 
                        onClick={handleDownload}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                    >
                        Télécharger
                    </button>
                </div>
            </div>
        </div>
    );
};