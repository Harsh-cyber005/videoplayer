import React from 'react'
import VideoPlayerDesktop from './VideoPlayerDesktop'
import VideoPlayerMobile from './VideoPlayerMobile'

function HLSPlayer() {
    const [isMobile, setIsMobile] = React.useState(false);
    const [varMob, setVarMob] = React.useState(false);

    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

    const handleResize = () => {
        setWindowWidth(window.innerWidth);
    };

    React.useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    React.useEffect(() => {
        setVarMob(window.matchMedia("(max-width: 768px)").matches);
        console.log("Mobile: ", varMob);
    }, [windowWidth])

    React.useEffect(() => {
        setIsMobile(varMob);
    }, [varMob])

    return (
        isMobile ? <VideoPlayerMobile /> : <VideoPlayerDesktop />
    )
}

export default HLSPlayer