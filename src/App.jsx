import React, { useEffect, useRef } from 'react';
import 'plyr/dist/plyr.css';

const HLSPlayer = () => {
    const videoRef = useRef(null);

    const [plyrObj, setPlyrObj] = React.useState(null);

    const [isMobile, setIsMobile] = React.useState(false);
    const [cornerCoordinates, setCornerCoordinates] = React.useState({});

    const updateCornerCoordinates = () => {
        if (videoRef.current) {
            const rect = videoRef.current.getBoundingClientRect();
            setCornerCoordinates({
                topLeft: { x: rect.left, y: rect.top },
                topRight: { x: rect.right, y: rect.top },
                bottomLeft: { x: rect.left, y: rect.bottom },
                bottomRight: { x: rect.right, y: rect.bottom },
            });
        }
    };

    React.useEffect(() => {
        const mobile = window.matchMedia("(max-width: 768px)").matches;
        setIsMobile(mobile);
    })

    useEffect(() => {
        const loadPlayer = () => {
            const video = videoRef.current;
            const source = "https://s3.ap-south-1.amazonaws.com/hls.harshmax.dev/videos/index.m3u8";
            const defaultOptions = {};

            if (window.Hls && window.Plyr && video) {
                const hls = new window.Hls();
                let player;

                hls.loadSource(source);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function (event, data) {
                    const availableQualities = hls.levels.map((l) => l.height);
                    defaultOptions.controls = [
                        'play-large',
                        (isMobile?'restart':''),
                        'rewind',
                        'play',
                        'fast-forward',
                        'progress',
                        'current-time',
                        'duration',
                        ...(isMobile?'mute':'s'),
                        ...(isMobile?'volume':""),
                        'settings',
                        ...(isMobile?'pip':''),
                        'fullscreen',
                    ];
                    defaultOptions.quality = {
                        default: availableQualities[0],
                        options: availableQualities,
                        forced: true,
                        onChange: (e) => updateQuality(e)
                    };
                    defaultOptions.speed = {
                        selected: 1,
                        options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
                    };
                    player = new window.Plyr(video, defaultOptions);
                    setPlyrObj(player);
                    // console.log(player);
                });
                hls.attachMedia(video);
                window.hls = hls;
                updateCornerCoordinates();

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
                // console.log(plyrObj);

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

        setTimeout(() => {
            var x;
            if (window.hls === undefined || window.Plyr === undefined) {
                x = setTimeout(() => {
                    window.location.reload();
                }, 300)
            };
        }, 500)

        // Cleanup function to remove scripts
        return () => {
            document.body.removeChild(scriptHls);
            document.body.removeChild(scriptPlyr);
        };
    }, []);

    return (
        <div style={{ maxHeight: '200px', maxWidth: '1000px', objectFit: 'fill' }}>
            <video ref={videoRef} style={{ height: '100%', width: '100%' }} id="player" controls></video>
        </div>
    );
};

export default HLSPlayer;
