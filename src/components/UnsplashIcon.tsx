export default function UnsplashLogo (props: {width: number, height: number}) {
  return (
    <img
        src='/task-gallery/unsplash_logo.png'
        width={props.width}
        height={props.height}
        alt='unsplash logo'
      />
  );
}
