import React, { useEffect } from 'react';
import 'plyr/dist/plyr.css';

const HLSPlayer = () => {
    useEffect(() => {
        const scriptHls = document.createElement('script');
        const scriptPlyr = document.createElement('script');

        scriptHls.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
        scriptPlyr.src = "https://cdn.plyr.io/3.7.8/plyr.js";

        document.body.appendChild(scriptHls);
        document.body.appendChild(scriptPlyr);

        scriptHls.onload = () => {
            scriptPlyr.onload = () => {
                const video = document.getElementById('player');
                const source = "https://s3.ap-south-1.amazonaws.com/hls.harshmax.dev/videos/index.m3u8";
                const defaultOptions = {};

                if (window.Hls.isSupported()) {
                    const hls = new window.Hls();
                    let player;

                    hls.loadSource(source);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function (event, data) {
                        const availableQualities = hls.levels.map((l) => l.height);
                        defaultOptions.controls = [
                            'play-large',
                            'restart',
                            'rewind',
                            'play',
                            'fast-forward',
                            'progress',
                            'current-time',
                            'duration',
                            'mute',
                            'volume',
                            'captions',
                            'settings',
                            'pip',
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
                    });
                    hls.attachMedia(video);
                    window.hls = hls;

                    document.addEventListener("keydown", function (e) {
                        if (e.key === "k") {
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
                    });
                }

                function updateQuality(newQuality) {
                    window.hls.levels.forEach((level, levelIndex) => {
                        if (level.height === newQuality) {
                            window.hls.currentLevel = levelIndex;
                        }
                    });
                }
            };
        };

        // Cleanup function to remove scripts
        return () => {
            document.body.removeChild(scriptHls);
            document.body.removeChild(scriptPlyr);
        };
    }, []);

    return (
        <div style={{ maxHeight: '200px', maxWidth: '1000px', objectFit: 'fill' }}>
            <video style={{ height: '100%', width: '100%' }} id="player" controls></video>
        </div>
    );
};

export default HLSPlayer;