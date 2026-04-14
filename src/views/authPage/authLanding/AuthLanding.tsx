// styles
import "./authLanding.scss";

// hooks | libraries
import { ReactElement } from "react";
import { Link } from "react-router-dom";
import { IoWallet, IoMail } from "react-icons/io5";
import { MdMusicNote } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

// assets
import macbookMockup from "../../../assets/background/minimalistic-macbook-pro-mockup.webp";
import phoneMockup from "../../../assets/background/womens-hands-holding-phone.webp";
import screenshot1 from "../../../assets/background/screenshot-1.webp";
import screenshot2 from "../../../assets/background/screenshot-2.webp";
import screenshot3 from "../../../assets/background/screenshot-3.webp";
import screenshot4 from "../../../assets/background/screenshot-4.webp";
import screenshot5 from "../../../assets/background/screenshot-5.webp";
import screenshot6 from "../../../assets/background/screenshot-6.webp";
import screenshot7 from "../../../assets/background/screenshot-7.webp";

// components
import Button from "../../../components/button/Button";

const SCREENSHOTS: string[] = [
  screenshot1,
  screenshot2,
  screenshot3,
  screenshot4,
  screenshot5,
  screenshot6,
  screenshot7,
];

interface IFeature {
  icon: ReactElement;
  title: string;
  description: string;
  className: string;
}

const FEATURES: IFeature[] = [
  {
    icon: <IoMail />,
    title: "Gestion des courriers",
    description:
      "Organisez vos courriers entrants et sortants. Suivi, archivage et recherche simplifiés.",
    className: "featureCourrier",
  },
  {
    icon: <IoWallet />,
    title: "Suivi financier",
    description:
      "Tableau de bord complet pour gérer votre budget, suivre vos dépenses et planifier.",
    className: "featureBudget",
  },
  {
    icon: <MdMusicNote />,
    title: "Musique & Guitare",
    description:
      "Programme d'apprentissage guitare, repertoire de morceaux et accordages personnalisés.",
    className: "featureMusique",
  },
];

export default function AuthLanding(): ReactElement {
  return (
    <section id="authLanding">
      {/* Hero */}
      <div className="hero" data-aos="fade-up">
        <div className="heroContent">
          <h2 className="heroTitle">
            Votre assistant
            <br />
            personnel <span className="heroAccent">tout-en-un</span>
          </h2>
          <p className="heroSubtitle">
            Gérez vos courriers, votre budget et votre musique en un seul
            endroit.
          </p>
          <Link to="/auth/login">
            <Button style="seaGreen">Se connecter</Button>
          </Link>
        </div>
        <div className="heroImage" data-aos="fade-up" data-aos-delay="200">
          <img
            src={macbookMockup}
            alt="Liryna sur MacBook Pro"
            loading="lazy"
          />
        </div>
      </div>

      {/* Features */}
      <div className="features">
        <h3 className="sectionTitle" data-aos="fade-up">
          Tout ce dont vous avez besoin
        </h3>
        <div className="featuresGrid">
          {FEATURES.map(
            (feature: IFeature, index: number): ReactElement => (
              <div
                key={feature.title}
                className={`featureCard ${feature.className}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="featureIcon">{feature.icon}</div>
                <h4 className="featureTitle">{feature.title}</h4>
                <p className="featureDescription">{feature.description}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Gallery Carousel */}
      <div className="gallery">
        <h3 className="sectionTitle" data-aos="fade-up">
          Découvrez l&apos;application
        </h3>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          centeredSlides={false}
          autoplay={{ delay: 3000, disableOnInteraction: true }}
          pagination={{ clickable: true }}
          breakpoints={{
            480: { slidesPerView: 1 },
            768: { slidesPerView: 1.3 },
            1024: { slidesPerView: 1.8 },
            1280: { slidesPerView: 2.2 },
          }}
          data-aos="fade-up"
        >
          {SCREENSHOTS.map(
            (src: string, index: number): ReactElement => (
              <SwiperSlide key={src}>
                <div className="galleryItem">
                  <img
                    src={src}
                    alt={`Capture d'écran ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ),
          )}
        </Swiper>
      </div>

      {/* Mobile */}
      <div className="mobile">
        <div className="mobileImage" data-aos="fade-right">
          <img
            src={phoneMockup}
            alt="Liryna sur iPhone"
            loading="lazy"
          />
        </div>
        <div className="mobileContent" data-aos="fade-left">
          <h3 className="mobileTitle">
            Emportez Liryna
            <br />
            partout avec vous
          </h3>
          <p className="mobileDescription">
            Interface optimisée mobile, accessible à tout moment. Vos données
            synchronisées sur tous vos appareils.
          </p>
          <Link to="/auth/login">
            <Button style="seaGreen">Commencer</Button>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="cta" data-aos="fade-up">
        <h3 className="ctaTitle">Prêt à simplifier votre quotidien ?</h3>
        <Link to="/auth/login">
          <Button style="seaGreen">Créer un compte</Button>
        </Link>
      </div>
    </section>
  );
}
