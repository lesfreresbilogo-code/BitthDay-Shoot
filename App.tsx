import React, { useState, useCallback, useEffect } from 'react';
import { generateBirthdayShoot } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HistoryGallery, HistoryItem } from './components/HistoryGallery';
import { ImageModal } from './components/ImageModal';

// Helper to convert data URL back to a File object for the edit functionality
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};


const App: React.FC = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [age, setAge] = useState<string>('');
    const [outfit, setOutfit] = useState<string>('');

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [modalImage, setModalImage] = useState<string | null>(null);


    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('birthdayShootHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('birthdayShootHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);

    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
            setOriginalFile(file);
            setError(null);
        };
        reader.readAsDataURL(file);
    }, []);

    const resetForm = useCallback(() => {
        setUploadedImage(null);
        setOriginalFile(null);
        setError(null);
        setIsLoading(false);
        setAge('');
        setOutfit('');
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!originalFile || !uploadedImage) {
            setError("Veuillez d'abord télécharger une image.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const resultBase64 = await generateBirthdayShoot(originalFile, age, outfit);
            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                generatedImage: `data:image/jpeg;base64,${resultBase64}`,
                originalImage: uploadedImage,
                age: age,
                outfit: outfit,
            };
            setHistory(prev => [newHistoryItem, ...prev]);
            resetForm();
        } catch (err) {
            console.error(err);
            setError("Désolé, une erreur s'est produite lors de la création de votre photo. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    }, [originalFile, age, outfit, uploadedImage, resetForm]);
    
    const handleDelete = useCallback((id: number) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleEdit = useCallback((item: HistoryItem) => {
        setUploadedImage(item.originalImage);
        setOriginalFile(dataURLtoFile(item.originalImage, 'editing-face.jpg'));
        setAge(item.age);
        setOutfit(item.outfit);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleView = useCallback((imageUrl: string) => {
        setModalImage(imageUrl);
    }, []);

    const outfitOptions = [
        { value: '', label: '-- Choisir un style --' },
        { value: 'Chic & Élégant', label: 'Chic & Élégant' },
        { value: 'Décontracté & Tendance', label: 'Décontracté & Tendance' },
        { value: 'Festif & Pailleté', label: 'Festif & Pailleté' },
        { value: 'Costume de super-héros', label: 'Costume de super-héros' },
        { value: 'Robe de bal de conte de fées', label: 'Robe de bal de conte de fées' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
                    Birthday Shoot
                </h1>
                <p className="text-lg text-indigo-200 mt-2">
                    Créez des photos d'anniversaire de rêve avec l'IA
                </p>
            </header>

            <main className="w-full max-w-xl flex-grow flex flex-col items-center">
                <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 transition-all duration-500 mb-12">
                    {isLoading ? (
                         <div className="text-center">
                           <LoadingSpinner />
                            <p className="mt-4 text-lg text-indigo-200 animate-pulse">Préparation de votre séance photo...</p>
                        </div>
                    ) : (
                        <>
                            {!uploadedImage ? (
                                <ImageUploader onImageUpload={handleImageUpload} />
                            ) : (
                                <>
                                    <div className="w-full text-center mb-6">
                                        <p className="mb-4 text-indigo-200">Personnalisez votre photo :</p>
                                        <img src={uploadedImage} alt="Preview" className="w-40 h-40 object-cover mx-auto rounded-full shadow-lg border-4 border-purple-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="age" className="block text-sm font-medium text-indigo-200 mb-1">
                                                Âge (pour les ballons)
                                            </label>
                                            <input
                                                type="number"
                                                id="age"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                placeholder="Ex: 25"
                                                className="w-full bg-white/10 border border-white/20 rounded-md p-2 text-white placeholder-indigo-400/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="outfit" className="block text-sm font-medium text-indigo-200 mb-1">
                                                Style vestimentaire
                                            </label>
                                            <select
                                                id="outfit"
                                                value={outfit}
                                                onChange={(e) => setOutfit(e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors appearance-none bg-no-repeat bg-right pr-8"
                                                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a5b4fc' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
                                            >
                                                {outfitOptions.map(option => (
                                                    <option key={option.value} value={option.value} className="bg-gray-800">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={handleGenerate}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-lg"
                                        >
                                            Générer ma photo !
                                        </button>
                                        <button onClick={resetForm} className="mt-3 text-sm text-indigo-300 hover:underline">
                                            Changer la photo
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {error && !isLoading && (
                        <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                           <p>{error}</p>
                           <button onClick={resetForm} className="mt-2 text-sm underline">Réessayer</button>
                        </div>
                    )}
                </div>

                <HistoryGallery 
                    history={history}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onView={handleView}
                />
            </main>
            
            {modalImage && <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}

            <footer className="w-full max-w-4xl text-center mt-8 p-4 text-sm text-indigo-300/70">
                <p>Propulsé par Gemini AI</p>
            </footer>
        </div>
    );
};

export default App;