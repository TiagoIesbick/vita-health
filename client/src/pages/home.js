import homeImg from '../assets/images/home.jfif';
import './home.css';

const Home = () => {
    return (
        <section className='align-items-center home-section card-min-height'>
            <div className="home-p text-center flex flex-column justify-content-evenly">
                <h1>Empower Your Health:<br/>Take Control of Your Medical Data</h1>
                <p><i className="pi pi-shield"></i> Share a token with your doctor to temporarily unlock access to your medical history and enable them to update it with new data.</p>
                <p><i className="pi pi-shield"></i> Securely manage your health records in one place. Vita empowers you to take charge of your medical journey.</p>
                <p><i className="pi pi-shield"></i> Your health, your data, your control. With Vita, securely access and manage your medical information anytime, anywhere.</p>
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