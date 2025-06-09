import  { useState, useRef } from 'react';
import { X, Upload, Send, Type } from 'lucide-react';
import { useAddStoryMutation } from '@/services/postApi';
import { updloadToCloudinary } from '@/utils/cloudinary';

interface AddStoryModalProps {
  isOpen: boolean,
  setIsOpen: (value: boolean) => void
}

export function AddStoryModal({isOpen, setIsOpen} : AddStoryModalProps) {
  const [addStory] = useAddStoryMutation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTextOverlay('');
    setShowTextEditor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetModal, 300); 
  };

  const handlePublish = async () => {
    if(!selectedFile) return

      const fileUrl = await updloadToCloudinary(selectedFile)
      const fileType = selectedFile.type.startsWith("image") ? "image" :  "video"

      await addStory({fileUrl, fileType})
      
    handleClose();
  };

  const colors = [
    '#ffffff', '#000000', '#ff4757', '#2ed573', '#3742fa',
    '#ffa502', '#ff6b9d', '#70a1ff', '#5352ed', '#ff3838'
  ];

  return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add Story</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Portrait Layout */}
            <div className="p-4">
              
              {/* Preview Area */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '9/16', height: '400px' }}>
                
                {!previewUrl ? (
                  /* Upload Area */
                  <div
                    className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 cursor-pointer hover:border-purple-400 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-300 text-center mb-2">Drop your photo or video here</p>
                    <p className="text-gray-500 text-sm">or click to browse</p>
                  </div>
                ) : (
                  /* Preview Content */
                  <div className="relative h-full">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                    )}
                    
                    {/* Text Overlay */}
                    {textOverlay && (
                      <div
                        className="absolute inset-0 flex items-center justify-center p-4"
                        style={{ backgroundColor: `${backgroundColor}40` }}
                      >
                        <p
                          className="text-center font-bold text-2xl break-words max-w-full"
                          style={{ color: textColor }}
                        >
                          {textOverlay}
                        </p>
                      </div>
                    )}

                    {/* Remove File Button */}
                    <button
                      onClick={resetModal}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Upload size={16} />
                  Upload Media
                </button>
                
                <button
                  onClick={() => setShowTextEditor(!showTextEditor)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <Type size={16} />
                  Text
                </button>
              </div>

              {/* Text Editor */}
              {showTextEditor && (
                <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <textarea
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    placeholder="Add text to your story..."
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="2"
                  />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Text Color:</span>
                    <div className="flex gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${textColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Background:</span>
                    <div className="flex gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${backgroundColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={!selectedFile && !textOverlay}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Share Story
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null
  
}