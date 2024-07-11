import React, { Suspense } from 'react'
const VideoPlayerDesktop = React.lazy(() => import('./VideoPlayerDesktop'))
const VideoPlayerMobile = React.lazy(() => import('./VideoPlayerMobile'))

function HLSPlayer() {
    const [isMobile, setIsMobile] = React.useState(false);
    const [varMob, setVarMob] = React.useState(false);

    React.useEffect(() => {
        setVarMob(window.matchMedia("(max-width: 768px)").matches);
    }, [])
    
    React.useEffect(() => {
        setIsMobile(varMob);
    }, [varMob])

    return (
        isMobile ? 
        <Suspense>
            <VideoPlayerMobile /> 
        </Suspense>
        :
        <Suspense>
            <VideoPlayerDesktop />
        </Suspense>
    )
}

export default HLSPlayer