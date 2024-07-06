/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-inner-declarations */
import React, { useEffect, useRef } from 'react';
import 'plyr/dist/plyr.css';

const HLSPlayer = () => {
    const [player, setPlayer] = React.useState(null);
    const videoRef = useRef(null);

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const mobile = window.matchMedia("(max-width: 768px)").matches;
        setIsMobile(mobile);
        console.log("Mobile: ", mobile);
    }, [])

    const optionsforMobile = [
        'play-large',
        'rewind',
        'play',
        'fast-forward',
        'progress',
        'current-time',
        'duration',
        'mute',
        'settings',
        'fullscreen',
    ]

    useEffect(() => {
        const loadPlayer = () => {
            const video = videoRef.current;
            const source = "https://s3.ap-south-1.amazonaws.com/hls.harshmax.dev/videos/index.m3u8";
            const defaultOptions = {};

            if (window.Hls && window.Plyr && video) {
                const hls = new window.Hls();

                hls.loadSource(source);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    const availableQualities = hls.levels.map((l) => l.height);
                    defaultOptions.controls = optionsforMobile;
                    defaultOptions.quality = {
                        default: availableQualities[0],
                        options: availableQualities,
                        forced: true,
                        onChange: (e) => updateQuality(e)
                    };
                    defaultOptions.speed = {
                        selected: 1,
                        options: [0.25, 0.5, 1, 1.5, 2]
                    };
                    setPlayer(new window.Plyr(video, defaultOptions));
                });
                hls.attachMedia(video);
                window.hls = hls;

                const handleKeyDown = (e) => {
                    if (e.key === " ") {
                        e.preventDefault();
                        player.togglePlay();
                    }
                    if (e.key === "ArrowRight") {
                        player.forward();
                    }
                    if (e.key === "ArrowLeft") {
                        player.rewind();
                    }
                    if (e.key === ">" && player.speed < 2) {
                        player.speed = player.speed + 0.25;
                    }
                    if (e.key === "<" && player.speed > 0.25) {
                        player.speed = player.speed - 0.25;
                    }
                };

                document.addEventListener("keydown", handleKeyDown);

                // Cleanup function to remove event listener
                return () => {
                    document.removeEventListener("keydown", handleKeyDown);
                };

                function updateQuality(newQuality) {
                    window.hls.levels.forEach((level, levelIndex) => {
                        if (level.height === newQuality) {
                            window.hls.currentLevel = levelIndex;
                        }
                    });
                }
            }
        };

        const scriptHls = document.createElement('script');
        const scriptPlyr = document.createElement('script');

        scriptHls.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
        scriptPlyr.src = "https://cdn.plyr.io/3.7.8/plyr.js";

        document.body.appendChild(scriptHls);
        document.body.appendChild(scriptPlyr);

        scriptHls.onload = () => {
            scriptPlyr.onload = loadPlayer;
        };

        var x;
        setTimeout(() => {
            if (window.hls === undefined || window.Plyr === undefined) {
                x = setTimeout(() => {
                    window.location.reload();
                }, 300)
            }
        }, 500)

        // Cleanup function to remove scripts
        return () => {
            document.body.removeChild(scriptHls);
            document.body.removeChild(scriptPlyr);
            clearTimeout(x);
        };
    }, []);

    const [mobilefs, setMobilefs] = React.useState(false);

    function enterFS() {
        if (isMobile) {
            document.documentElement.style.setProperty('--sfs-animation', 'plyr-popup .2s ease');
            document.documentElement.style.setProperty('--sfs-bottom', '100%');
            document.documentElement.style.setProperty('--sfs-transform', 'none');
            document.documentElement.style.setProperty('--sfs-transition', '.2s');

            setMobilefs(true);
        }
    }

    function exitFS() {
        document.documentElement.style.setProperty('--sfs-animation', 'none');
        document.documentElement.style.setProperty('--sfs-bottom', '0');
        document.documentElement.style.setProperty('--sfs-transform', 'translateY(calc(100% + 10px))');
        document.documentElement.style.setProperty('--sfs-transition', 'none');
        setMobilefs(false);
    }

    document.addEventListener("fullscreenchange", () => {
        document.fullscreenElement ? enterFS() : exitFS();
    })

    return (
        <div className={` w-full ${mobilefs ? "h-screen" : "max-w-[1000px]"} h-min object-fill`}>
            <video ref={videoRef} className={`${mobilefs ? "" : "h-full"} w-full`} id="player" controls></video>
        </div>
    );
};

export default HLSPlayer;