// ================================
// VIBEFLOW MUSIC PLAYER
// Main Application
// ================================

/**
 * Main Music Player Class
 * Handles all player functionality and state management
 */
class MusicPlayer {
    constructor() {
        // Audio element
        this.audio = document.getElementById('audio');
        
        // Player state
        this.state = {
            currentIndex: 0,
            isPlaying: false,
            isSeeking: false,
            volume: loadFromStorage('vibeflow-volume', 0.7),
            previousVolume: 0.7
        };
        
        // DOM elements - Controls
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // DOM elements - Display
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.albumCover = document.getElementById('albumCover');
        this.albumPlaceholder = document.getElementById('albumPlaceholder');
        this.albumCoverContainer = document.getElementById('albumCoverContainer');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.playlistContainer = document.getElementById('playlistContainer');
        this.playlistCount = document.getElementById('playlistCount');
        
        // DOM elements - Icons
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        
        // DOM elements - Progress
        this.progressBar = document.getElementById('progressBar');
        this.progressFilled = document.getElementById('progressFilled');
        this.progressHandle = document.getElementById('progressHandle');
        
        // DOM elements - Volume
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeBar = document.getElementById('volumeBar');
        this.volumeFilled = document.getElementById('volumeFilled');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeHighIcon = document.getElementById('volumeHighIcon');
        this.volumeMuteIcon = document.getElementById('volumeMuteIcon');
        
        // DOM elements - Search
        this.searchInput = document.getElementById('searchInput');
        
        // Initialize player
        this.init();
    }
    
    /**
     * Initialize the music player
     */
    init() {
        console.log('🎵 VibeFlow Music Player Initializing...');
        
        // Set initial volume
        this.audio.volume = this.state.volume;
        this.updateVolumeUI();
        
        // Render playlist
        this.renderPlaylist();
        
        // Load first song
        this.loadSong(0);
        
        // Attach event listeners
        this.attachEventListeners();
        
        console.log('✅ Music Player Ready!');
    }
    
    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.audio.addEventListener('ended', () => this.onSongEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        // Progress bar seeking
        this.progressBar.addEventListener('click', (e) => this.seekByClick(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startSeek(e));
        
        // Volume control
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeBar.addEventListener('click', (e) => this.setVolumeByClick(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startVolumeSeek(e));
        
        // Playlist interaction
        this.playlistContainer.addEventListener('click', (e) => this.onPlaylistClick(e));
        
        // Search functionality (for Task 3, basic setup)
        this.searchInput.addEventListener('input', debounce((e) => this.onSearch(e), 300));
        
        // Keyboard shortcuts (basic for now, full implementation in Task 4)
        document.addEventListener('keydown', (e) => this.onKeyPress(e));
    }
    
    /**
     * Render the playlist UI
     */
    renderPlaylist() {
        this.playlistContainer.innerHTML = '';
        
        playlist.forEach((song, index) => {
            const playlistItem = this.createPlaylistItem(song, index);
            this.playlistContainer.appendChild(playlistItem);
        });
        
        this.updatePlaylistCount();
    }
    
    /**
     * Create a playlist item element
     * @param {Object} song - Song data object
     * @param {number} index - Song index in playlist
     * @returns {HTMLElement} Playlist item element
     */
    createPlaylistItem(song, index) {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.dataset.index = index;
        item.tabIndex = 0;
        
        item.innerHTML = `
            <div class="playlist-item-number">${index + 1}</div>
            <div class="playlist-item-cover">
                <img src="${song.cover}" alt="${song.title} cover" 
                     onerror="this.style.display='none'; this.parentElement.classList.add('no-image')">
                <div class="cover-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </div>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
            <div class="playlist-item-duration">${song.duration}</div>
        `;
        
        return item;
    }
    
    /**
     * Update playlist count display
     */
    updatePlaylistCount() {
        const count = playlist.length;
        this.playlistCount.textContent = `${count} song${count !== 1 ? 's' : ''}`;
    }
    
    /**
     * Load a song by index
     * @param {number} index - Song index to load
     */
    loadSong(index) {
        // Validate index
        if (index < 0 || index >= playlist.length) {
            console.error('Invalid song index:', index);
            return;
        }
        
        const song = playlist[index];
        
        // Update state
        this.state.currentIndex = index;
        
        // Update audio source
        this.audio.src = song.audio;
        this.audio.load();
        
        // Update UI
        this.updateSongInfo(song);
        this.highlightCurrentSong();
        
        console.log(`📀 Loaded: ${song.title} by ${song.artist}`);
    }
    
    /**
     * Update song information display
     * @param {Object} song - Song data object
     */
    updateSongInfo(song) {
        // Update text
        this.songTitle.textContent = song.title;
        this.songArtist.textContent = song.artist;
        
        // Remove empty state classes
        this.songTitle.classList.remove('empty-state');
        this.songArtist.classList.remove('empty-state');
        
        // Update album cover
        this.albumCover.src = song.cover;
        this.albumCover.style.display = 'block';
        this.albumPlaceholder.style.display = 'none';
        
        // Handle image load error
        this.albumCover.onerror = () => {
            this.albumCover.style.display = 'none';
            this.albumPlaceholder.style.display = 'flex';
        };
    }
    
    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.state.isPlaying) {
            this.pauseSong();
        } else {
            this.playSong();
        }
    }
    
    /**
     * Play the current song
     */
    playSong() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.state.isPlaying = true;
                    this.updatePlayPauseUI();
                    this.albumCoverContainer.classList.add('playing');
                    console.log('▶️ Playing');
                })
                .catch((error) => {
                    console.error('Playback failed:', error);
                    // Browser prevented autoplay
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay blocked. User interaction required.');
                    }
                });
        }
    }
    
    /**
     * Pause the current song
     */
    pauseSong() {
        this.audio.pause();
        this.state.isPlaying = false;
        this.updatePlayPauseUI();
        this.albumCoverContainer.classList.remove('playing');
        this.albumCoverContainer.classList.add('paused');
        console.log('⏸️ Paused');
    }
    
    /**
     * Play next song
     */
    nextSong() {
        let nextIndex = this.state.currentIndex + 1;
        
        // Loop back to start if at end
        if (nextIndex >= playlist.length) {
            nextIndex = 0;
        }
        
        this.loadSong(nextIndex);
        
        // Continue playing if currently playing
        if (this.state.isPlaying) {
            this.playSong();
        }
    }
    
    /**
     * Play previous song
     */
    prevSong() {
        // If song has played more than 3 seconds, restart it
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        
        let prevIndex = this.state.currentIndex - 1;
        
        // Loop to end if at start
        if (prevIndex < 0) {
            prevIndex = playlist.length - 1;
        }
        
        this.loadSong(prevIndex);
        
        // Continue playing if currently playing
        if (this.state.isPlaying) {
            this.playSong();
        }
    }
    
    /**
     * Update play/pause button UI
     */
    updatePlayPauseUI() {
        if (this.state.isPlaying) {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
            this.playBtn.setAttribute('aria-label', 'Pause');
            this.playBtn.setAttribute('title', 'Pause');
        } else {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.playBtn.setAttribute('aria-label', 'Play');
            this.playBtn.setAttribute('title', 'Play');
        }
    }
    
    /**
     * Update progress bar based on current time
     */
    updateProgress() {
        if (this.state.isSeeking) return;
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        // Update time display
        this.currentTime.textContent = formatTime(currentTime);
        
        // Update progress bar
        if (duration && !isNaN(duration)) {
            const percentage = getPercentage(currentTime, duration);
            this.progressFilled.style.width = `${percentage}%`;
        }
    }
    
    /**
     * Handle metadata loaded event
     */
    onMetadataLoaded() {
        const duration = this.audio.duration;
        this.totalTime.textContent = formatTime(duration);
        console.log(`⏱️ Duration: ${formatTime(duration)}`);
    }
    
    /**
     * Handle song ended event
     */
    onSongEnded() {
        console.log('🏁 Song ended');
        this.nextSong();
    }
    
    /**
     * Handle play event
     */
    onPlay() {
        this.state.isPlaying = true;
        this.updatePlayPauseUI();
    }
    
    /**
     * Handle pause event
     */
    onPause() {
        this.state.isPlaying = false;
        this.updatePlayPauseUI();
    }
    
    /**
     * Handle audio error
     */
    onAudioError(e) {
        console.error('Audio error:', e);
        const song = playlist[this.state.currentIndex];
        console.error(`Failed to load: ${song.title}`);
        // Could show error message to user here
    }
    
    /**
     * Seek to position by clicking progress bar
     * @param {Event} e - Click event
     */
    seekByClick(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clamp((clickX / rect.width) * 100, 0, 100);
        const newTime = getValueFromPercentage(percentage, this.audio.duration);
        
        this.audio.currentTime = newTime;
        this.progressFilled.style.width = `${percentage}%`;
    }
    
    /**
     * Start seeking with progress handle
     * @param {Event} e - Mouse down event
     */
    startSeek(e) {
        e.preventDefault();
        this.state.isSeeking = true;
        
        const onMouseMove = (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const moveX = e.clientX - rect.left;
            const percentage = clamp((moveX / rect.width) * 100, 0, 100);
            
            this.progressFilled.style.width = `${percentage}%`;
            const newTime = getValueFromPercentage(percentage, this.audio.duration);
            this.currentTime.textContent = formatTime(newTime);
        };
        
        const onMouseUp = () => {
            this.state.isSeeking = false;
            const percentage = parseFloat(this.progressFilled.style.width);
            const newTime = getValueFromPercentage(percentage, this.audio.duration);
            this.audio.currentTime = newTime;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    /**
     * Set volume by clicking volume bar
     * @param {Event} e - Click event
     */
    setVolumeByClick(e) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clamp((clickX / rect.width) * 100, 0, 100);
        const volume = percentage / 100;
        
        this.setVolume(volume);
    }
    
    /**
     * Start volume seeking with handle
     * @param {Event} e - Mouse down event
     */
    startVolumeSeek(e) {
        e.preventDefault();
        
        const onMouseMove = (e) => {
            const rect = this.volumeBar.getBoundingClientRect();
            const moveX = e.clientX - rect.left;
            const percentage = clamp((moveX / rect.width) * 100, 0, 100);
            const volume = percentage / 100;
            
            this.setVolume(volume);
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    /**
     * Set volume level
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        volume = clamp(volume, 0, 1);
        this.audio.volume = volume;
        this.state.volume = volume;
        this.updateVolumeUI();
        saveToStorage('vibeflow-volume', volume);
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        if (this.state.volume > 0) {
            this.state.previousVolume = this.state.volume;
            this.setVolume(0);
        } else {
            this.setVolume(this.state.previousVolume || 0.7);
        }
    }
    
    /**
     * Update volume UI
     */
    updateVolumeUI() {
        const percentage = this.state.volume * 100;
        this.volumeFilled.style.width = `${percentage}%`;
        
        // Update icon
        if (this.state.volume === 0) {
            this.volumeHighIcon.classList.add('hidden');
            this.volumeMuteIcon.classList.remove('hidden');
        } else {
            this.volumeHighIcon.classList.remove('hidden');
            this.volumeMuteIcon.classList.add('hidden');
        }
    }
    
    /**
     * Highlight currently playing song in playlist
     */
    highlightCurrentSong() {
        // Remove active class from all items
        const items = this.playlistContainer.querySelectorAll('.playlist-item');
        items.forEach(item => item.classList.remove('active'));
        
        // Add active class to current song
        const currentItem = this.playlistContainer.querySelector(
            `.playlist-item[data-index="${this.state.currentIndex}"]`
        );
        if (currentItem) {
            currentItem.classList.add('active');
            
            // Scroll into view if needed
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    /**
     * Handle playlist item click
     * @param {Event} e - Click event
     */
    onPlaylistClick(e) {
        const playlistItem = e.target.closest('.playlist-item');
        if (!playlistItem) return;
        
        const index = parseInt(playlistItem.dataset.index);
        
        // Load and play the selected song
        this.loadSong(index);
        this.playSong();
    }
    
    /**
     * Handle search input (basic implementation)
     * @param {Event} e - Input event
     */
    onSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const items = this.playlistContainer.querySelectorAll('.playlist-item');
        
        items.forEach(item => {
            const title = item.querySelector('.playlist-item-title').textContent.toLowerCase();
            const artist = item.querySelector('.playlist-item-artist').textContent.toLowerCase();
            
            if (title.includes(query) || artist.includes(query)) {
                item.style.display = 'grid';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    /**
     * Handle keyboard shortcuts (basic implementation)
     * @param {Event} e - Keyboard event
     */
    onKeyPress(e) {
        // Don't trigger if typing in search
        if (e.target === this.searchInput) return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowRight':
                this.nextSong();
                break;
            case 'ArrowLeft':
                this.prevSong();
                break;
        }
    }
}

// ================================
// INITIALIZE APPLICATION
// ================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create music player instance
    window.musicPlayer = new MusicPlayer();
});