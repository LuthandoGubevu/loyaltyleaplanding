
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
// PlayCircle and Image components are no longer needed as we're using a native <video> element.

export function VideoSection() {
  const videoFileName = "loyalty-leap-demo.mp4"; // Assumed video filename in /public

  return (
    <section id="demo-video" className="py-16 md:py-24 bg-background">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            See Loyalty Leap in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Watch our quick demo to understand how easily you can boost customer retention.
          </p>
        </div>
        <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl">
          {/* 
            The 'group' and 'cursor-pointer' classes were removed from this div
            as the PlayCircle overlay is also removed in favor of native video controls.
          */}
          <video
            src={`/${videoFileName}`} // Path relative to the public folder
            width="1920" // Native width of the video (e.g., 1920 for 1080p)
            height="1080" // Native height of the video (e.g., 1080 for 1080p)
            controls
            className="w-full h-full object-cover rounded-xl" // Ensures video fills container, maintains aspect ratio, and has rounded corners
            preload="metadata" // Good practice: fetches video metadata (dimensions, duration) without downloading the video
          >
            Your browser does not support the video tag. Consider upgrading your browser.
          </video>
          {/* 
            The PlayCircle overlay has been removed.
            If you desire a custom play button that appears before the video starts,
            you would need to implement that with additional React state and JavaScript
            to control the video element's play/pause state.
            For now, standard video controls are enabled.
          */}
        </div>
        <p className="text-center mt-6 text-muted-foreground">
          See how Loyalty Leap works in 60 seconds.
        </p>
      </MaxWidthWrapper>
    </section>
  );
}
