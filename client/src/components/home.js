import homeImg from '../assets/images/home.jfif';

const Home = () => {
    return (
        <div className='flex w-full' style={{height: 'calc(100vh - 128px)'}}>
        <img src={homeImg} alt='home' className='w-full h-auto' style={{objectFit: 'cover'}} />
    </div>
    );
};
export default Home;