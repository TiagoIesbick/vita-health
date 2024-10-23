import homeImg from '../assets/images/home.jfif';
import './home.css';

const Home = () => {
    return (
        <section className='align-items-center home-section card-min-height'>
            <div className="home-p flex flex-column justify-content-evenly">
                <h1 className="text-center">Empower Your Health:<br/>Take Control of Your Medical Data with AI-Powered Insights</h1>
                <p className="text-justify mx-2"><i className="pi pi-ticket"></i> Share a token with your healthcare professional to temporarily unlock your medical history, allowing them to update it with new data and gain insights that enhance your care.</p>
                <p className="text-justify mx-2"><i className="pi pi-microchip-ai"></i> Unlock valuable insights from your health data. Vita’s AI empowers both you and your healthcare professional to understand critical patterns and trends in your medical history.</p>
                <p className="text-justify mx-2"><i className="pi pi-shield"></i> Your health, your data, your control. With Vita, securely access and manage your medical information anytime, anywhere, with the added power of AI-driven insights.</p>
            </div>
            <img
                src={homeImg}
                alt='home'
                className='home-img'
            />
        </section>
    );
};
export default Home;