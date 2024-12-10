import { useLanguage } from "../providers/languageContext";
import homeImg from '../assets/images/home.jfif';
import './home.css';

const Home = () => {
    const { translations } = useLanguage();

    return (
        <section className='align-items-center home-section card-min-height'>
            <div className="home-p flex flex-column justify-content-evenly">
                <h1 className="text-center">{translations?.home?.title}
                    <br/>{translations?.home?.subtitle}
                </h1>
                <p className="text-justify mx-2"><i className="pi pi-microchip-ai"></i> {translations?.home?.insights_info}</p>
                <p className="text-justify mx-2"><i className="pi pi-ticket"></i> {translations?.home?.token_info}</p>
                <p className="text-justify mx-2"><i className="pi pi-shield"></i> {translations?.home?.security_info}</p>
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