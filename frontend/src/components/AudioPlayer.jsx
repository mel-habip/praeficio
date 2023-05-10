import React, { useState, useEffect, useRef, lazy } from 'react';

import './AudioPlayer.css';

/**
 * Credit & Appreciation
 * Built based on the works of Ryan Finni
 * https://letsbuildui.dev/articles/building-an-audio-player-with-react-hooks
 */

/**
 * @component AudioPlayer provides a UI that plays music
 * @param {Array<{title:string, artist:string, audioSrc:string, imageSrc:string}>} tracks
 * @note `audioSrc` and `imageSrc` must be relative directories based on this file
 */
export default function AudioPlayer({ tracks }) {
    // State
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);


    // Destructure for conciseness
    const { title, artist, color, imageName, audioName } = tracks[trackIndex];

    const fileNameMatcher = (name) => {
        switch (name.trim().toLowerCase()) {
            case 'dvorak': return 'dvorak.jpg';
            case 'dvorak_symphony_9_movement_4': return 'dvorak_symphony_9_movement_4.mp3';
            case 'prokofiev': return 'prokofiev.jpg';
            case 'romeo_and_juliet': return 'romeo_and_juliet.mp3';
            case 'we_are_one': return 'we_are_one.jpg';
            case 'fur_beethoven': return 'fur_beethoven.mp3';
            default: console.error('Unknown track');
        }
    }

    // Refs
    const audioRef = useRef(new Audio(fileNameMatcher(audioName)));
    const intervalRef = useRef();
    const isReady = useRef(false);

    // Destructure for conciseness
    const { duration } = audioRef.current;

    const toPrevTrack = () => {
        console.log('TODO go to prev');
        if (trackIndex - 1 < 0) {
            setTrackIndex(tracks.length - 1);
        } else {
            setTrackIndex(trackIndex - 1);
        }
    }

    const toNextTrack = () => {
        console.log('TODO go to next');
        if (trackIndex < tracks.length - 1) {
            setTrackIndex(trackIndex + 1);
        } else {
            setTrackIndex(0);
        }
    }

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
            startTimer();
        } else {
            clearInterval(intervalRef.current);
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        // Pause and clean up on unmount
        return () => {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, []);

    // Handle setup when changing tracks
    useEffect(() => {
        audioRef.current.pause();

        audioRef.current = new Audio(fileNameMatcher(audioName));
        setTrackProgress(audioRef.current.currentTime);

        if (isReady.current) {
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        } else {
            // Set the isReady ref as true for the next pass
            isReady.current = true;
        }
    }, [trackIndex]);

    const startTimer = () => {
        // Clear any timers already running
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (audioRef.current.ended) {
                toNextTrack();
            } else {
                setTrackProgress(audioRef.current.currentTime);
            }
        }, [1000]);
    };

    //scrub = when user touches the progress bar
    const onScrub = (value) => {
        // Clear any timers already running
        clearInterval(intervalRef.current);
        audioRef.current.currentTime = value;
        setTrackProgress(audioRef.current.currentTime);
    };

    const onScrubEnd = () => {
        // If not already playing, start
        if (!isPlaying) {
            setIsPlaying(true);
        }
        startTimer();
    };

    const currentPercentage = duration ? `${(trackProgress / duration) * 100}%` : '0%';
    const trackStyling = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))`;

    return (
        <div className="audio-player">
            <div className="track-info">
                {!!imageName &&
                    <img
                        className="artwork"
                        loading="lazy"
                        src={fileNameMatcher(imageName)}
                        alt={`track artwork for ${title} by ${artist}`}
                    />}
                <h2 className="title">{title}</h2>
                <h3 className="artist">{artist}</h3>
                <AudioControls
                    isPlaying={isPlaying}
                    onPrevClick={toPrevTrack}
                    onNextClick={toNextTrack}
                    onPlayPauseClick={setIsPlaying}
                />
                <input
                    type="range"
                    value={trackProgress}
                    step="1"
                    min="0"
                    max={duration ? duration : `${duration}`}
                    className="progress"
                    onChange={(e) => onScrub(e.target.value)}
                    onMouseUp={onScrubEnd}
                    onKeyUp={onScrubEnd}
                    style={{ background: trackStyling }}
                />
            </div>
            <Backdrop
                trackIndex={trackIndex}
                activeColor={color}
                isPlaying={isPlaying}
            />
        </div>
    );
};

function AudioControls({
    isPlaying,
    onPlayPauseClick,
    onPrevClick,
    onNextClick,
}) {
    return (
        <div className="audio-controls">
            <button
                type="button"
                className="prev"
                aria-label="Previous"
                onClick={onPrevClick}
            >
                <i className="fa-solid fa-backward" />
            </button>
            {isPlaying ? (
                <button
                    type="button"
                    className="pause"
                    onClick={() => onPlayPauseClick(false)}
                    aria-label="Pause"
                >
                    <i className="fa-solid fa-pause" />
                </button>
            ) : (
                <button
                    type="button"
                    className="play"
                    onClick={() => onPlayPauseClick(true)}
                    aria-label="Play"
                >
                    <i className="fa-solid fa-play" />
                </button>
            )}
            <button
                type="button"
                className="next"
                aria-label="Next"
                onClick={onNextClick}
            >
                <i className="fa-solid fa-forward" />
            </button>
        </div>
    );
};


function Backdrop({
    activeColor,
    trackIndex,
    isPlaying,
}) {
    useEffect(() => {
        document.documentElement.style.setProperty('--active-color', activeColor);
    }, [trackIndex]);

    return (
        <div className={`color-backdrop ${isPlaying ? 'playing' : 'idle'}`} />
    );
};