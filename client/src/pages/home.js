import homeImg from '../assets/images/home.jfif';
import './home.css';

const Home = () => {
    return (
        <section className='align-items-center home-section'>
            <div className="home-p text-center flex flex-column justify-content-evenly">
                <h1>Empower Your Health:<br/>Take Control of Your Medical Data</h1>
                <p><i className="pi pi-shield"></i> Securely manage your health records in one place. Vita puts you in control, empowering you to take charge of your medical journey.</p>
                <p><i className="pi pi-shield"></i> Your health, your data, your control. With Vita, securely access and manage your medical information anytime, anywhere.</p>
                <p><i className="pi pi-shield"></i> Simplify your healthcare experience. Vita gives you the power to track, share, and protect your medical data with ease.</p>
            </div>
            <img
                src={homeImg}
                alt='home'
                className='home-img w-full'
            />
        </section>
    );
};
export default Home;