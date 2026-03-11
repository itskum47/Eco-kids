import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaLeaf,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaHeart
} from 'react-icons/fa';
import { TrustFooter } from '../TrustIndicators';

const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { path: '/topics', label: t('nav.topics') },
    { path: '/games', label: t('nav.games') },
    { path: '/experiments', label: t('nav.experiments') },
    { path: '/quizzes', label: t('nav.quizzes') }
  ];

  const resources = [
    { path: '/help', label: t('footer.helpCenter') },
    { path: '/faq', label: t('footer.faq') },
    { path: '/contact', label: t('footer.contactUs') }
  ];

  const legal = [
    { path: '/privacy-policy', label: t('footer.privacyPolicy') },
    { path: '/terms', label: t('footer.termsOfService') },
    { path: '/accessibility', label: 'Accessibility Statement' }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: '#', color: 'text-blue-600' },
    { icon: FaTwitter, href: '#', color: 'text-blue-400' },
    { icon: FaInstagram, href: '#', color: 'text-pink-600' },
    { icon: FaYoutube, href: '#', color: 'text-red-600' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <FaLeaf className="text-2xl text-green-400" />
              <span className="text-xl font-bold">EcoKids India</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-3">{t('footer.newsletter')}</h4>
              <p className="text-gray-300 text-sm mb-3">
                {t('footer.newsletterDescription')}
              </p>
              <label htmlFor="newsletter-email" className="sr-only">
                Newsletter email address
              </label>
              <div className="flex">
                <input
                  id="newsletter-email"
                  type="email"
                  aria-label="Newsletter email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:border-green-400"
                />
                <button aria-label="Subscribe to newsletter" className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-r-lg text-sm font-medium transition-colors">
                  {t('footer.subscribe')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 text-sm hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 text-sm hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 mb-6">
              {legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 text-sm hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-3">{t('footer.followUs')}</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={`${social.color} hover:scale-110 transition-transform text-xl`}
                      aria-label={`Open EcoKids ${social.icon.name?.replace('Fa', '') || 'social'} page`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <TrustFooter />

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
            {t('footer.madeWithLove')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;