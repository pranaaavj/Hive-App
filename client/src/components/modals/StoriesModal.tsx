import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Story {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  isSeen: boolean;
}

interface UserStories {
  stories: Story[];
  userId: string;
  username: string;
  profilePicture: string;
}

interface StoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStoriesData: UserStories[];
  initialUserIndex?: number;
  initialStoryIndex?: number;
  onMarkStorySeen?: (storyId: string) => void; // Added prop for marking story as seen
}

export const StoriesModal: React.FC<StoriesModalProps> = ({
  isOpen,
  onClose,
  userStoriesData,
  initialUserIndex = 0,
  initialStoryIndex = 0,
  onMarkStorySeen, // Added prop
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const storyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUser = userStoriesData?.[currentUserIndex];
  const currentStory = currentUser?.stories?.[currentStoryIndex];
  const storyDuration = currentStory?.mediaType === 'video' ? 15000 : 5000;

  const seenStoryIds = useRef<Set<string>>(new Set());
  // Fixed: Reset to initial indices when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(initialUserIndex);
      setCurrentStoryIndex(initialStoryIndex);
      setIsPlaying(true);
      setProgress(0);
      setIsVideoLoaded(false);
    }
  }, [isOpen, initialUserIndex, initialStoryIndex]);

  useEffect(() => {
    if (
      isOpen &&
      currentStory &&
      !currentStory.isSeen &&
      onMarkStorySeen &&
      !seenStoryIds.current.has(currentStory._id)
    ) {
      seenStoryIds.current.add(currentStory._id);
      onMarkStorySeen(currentStory._id);
    }
  }, [isOpen, currentStory, onMarkStorySeen]);

  const resetProgress = () => {
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (storyTimeoutRef.current) {
      clearTimeout(storyTimeoutRef.current);
    }
  };

  const startProgress = () => {
    if (!isPlaying) return;
    
    resetProgress();
    
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        goToNextStory();
      }
    }, 50);
  };

  const goToNextStory = () => {
    const hasMoreStories = currentStoryIndex < currentUser.stories.length - 1;
    const hasMoreUsers = currentUserIndex < userStoriesData.length - 1;

    if (hasMoreStories) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (hasMoreUsers) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goToPreviousStory = () => {
    const hasPreviousStories = currentStoryIndex > 0;
    const hasPreviousUsers = currentUserIndex > 0;

    if (hasPreviousStories) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (hasPreviousUsers) {
      const previousUserIndex = currentUserIndex - 1;
      const previousUser = userStoriesData[previousUserIndex];
      setCurrentUserIndex(previousUserIndex);
      setCurrentStoryIndex(previousUser.stories.length - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVideoLoadedData = () => {
    setIsVideoLoaded(true);
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoEnded = () => {
    goToNextStory();
  };

  useEffect(() => {
    if (isOpen && currentStory) {
      if (currentStory.mediaType === 'image') {
        startProgress();
      } else {
        setIsVideoLoaded(false);
      }
    }
    
    return () => {
      resetProgress();
    };
  }, [isOpen, currentUserIndex, currentStoryIndex, isPlaying]);

  useEffect(() => {
    if (currentStory?.mediaType === 'video' && isVideoLoaded && isPlaying) {
      startProgress();
    }
  }, [isVideoLoaded, isPlaying, currentStory]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousStory();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (e.key === ' ') {
            togglePlayPause();
          } else {
            goToNextStory();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentUserIndex, currentStoryIndex, isPlaying]);

  if (!isOpen || !currentUser || !currentStory) {
    return null;
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/90" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md h-full max-h-[800px] bg-black rounded-lg overflow-hidden">
        <div className="absolute top-2 left-4 right-4 flex gap-1 z-20">
          {currentUser.stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: index < currentStoryIndex 
                    ? '100%' 
                    : index === currentStoryIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.username}
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
            />
            <div className="text-white">
              <p className="font-semibold text-sm">{currentUser.username}</p>
              <p className="text-xs text-white/70">{formatTimeAgo(currentStory.createdAt)}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.mediaType === 'image' ? (
            <img 
              src={currentStory.mediaUrl} 
              alt="Story"
              className="w-full h-full object-cover"
              onLoad={() => setIsVideoLoaded(true)}
            />
          ) : (
            <video 
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="w-full h-full object-cover"
              onLoadedData={handleVideoLoadedData}
              onEnded={handleVideoEnded}
              playsInline
              muted
            />
          )}
          
          {currentStory.mediaType === 'video' && !isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex z-10">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={goToPreviousStory}
          />
          
          <div 
            className="flex-1 cursor-pointer" 
            onClick={goToNextStory}
          />
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          {(currentUserIndex > 0 || currentStoryIndex > 0) && (
            <button 
              onClick={goToPreviousStory}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          {(currentUserIndex < userStoriesData.length - 1 || currentStoryIndex < currentUser.stories.length - 1) && (
            <button 
              onClick={goToNextStory}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {currentStory.mediaType === 'video' && isVideoLoaded && (
          <button 
            onClick={togglePlayPause}
            className="absolute bottom-4 right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}

        <div className="absolute bottom-4 left-4 text-white/70 text-sm z-20">
          {currentStoryIndex + 1} / {currentUser.stories.length}
        </div>
      </div>
    </div>
  );
};