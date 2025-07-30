import React, { useState, useEffect, useRef } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'
import ConsultantList from '@/components/ConsultantList'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  Calendar,
  MessageSquare,
  Clock as ClockIcon,
  Award,
  Shield,
  CheckCircle,
  Leaf,
  Stethoscope,
  Medal,
  FileCheck,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PreFooter from '../../components/PreFooter'

const AboutPage = () => {
  // Thông tin công ty
  const [companyInfo] = useState({
    yearsOfExperience: 15,
    totalExperts: 50,
    happyClients: 10000,
    description:
      'WellCare được thành lập với sứ mệnh mang đến dịch vụ chăm sóc sức khỏe giới tính toàn diện, chất lượng và riêng tư cho phụ nữ Việt Nam.',
    mission:
      'Tạo ra một môi trường y tế an toàn, thân thiện và chuyên nghiệp, nơi mọi phụ nữ có thể thoải mái chăm sóc sức khỏe giới tính của mình.'
  })

  // Giá trị cốt lõi
  const [values] = useState([
    {
      icon: Heart,
      title: 'Chăm sóc tận tâm',
      description:
        'Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn với sự riêng tư và chuyên nghiệp cao nhất.'
    },
    {
      icon: Shield,
      title: 'Riêng tư & Bảo mật',
      description:
        'Mọi thông tin cá nhân và vấn đề sức khỏe của bạn được bảo mật tuyệt đối theo tiêu chuẩn y khoa quốc tế.'
    },
    {
      icon: Award,
      title: 'Chất lượng cao cấp',
      description:
        'Áp dụng phương pháp và công nghệ y tế hiện đại, đảm bảo kết quả chính xác và hiệu quả trong điều trị.'
    }
  ])

  // Dịch vụ
  const [services] = useState([
    {
      icon: Calendar,
      title: 'Theo dõi chu kỳ kinh nguyệt',
      description:
        'Ứng dụng thông minh giúp theo dõi chu kỳ kinh nguyệt, dự đoán ngày rụng trứng và quản lý sức khỏe sinh sản.'
    },
    {
      icon: MessageSquare,
      title: 'Tư vấn sức khỏe trực tuyến',
      description:
        'Kết nối trực tiếp với chuyên gia y tế qua video call để được tư vấn về các vấn đề sức khỏe sinh sản và tình dục.'
    },
    {
      icon: Stethoscope,
      title: 'Xét nghiệm sức khỏe STI',
      description: 'Dịch vụ xét nghiệm đa dạng từ kiểm tra chuỗi virus HPV, HIV, chuỗi virus viêm gan B, C'
    },
    {
      icon: CheckCircle,
      title: 'Điều trị chuyên sâu',
      description:
        'Điều trị các bệnh phụ khoa, rối loạn nội tiết, và các vấn đề sức khỏe sinh sản khác với phác đồ cá nhân hóa.'
    },
    {
      icon: Leaf,
      title: 'Tư vấn dinh dưỡng',
      description:
        'Chế độ dinh dưỡng cân bằng hỗ trợ chu kỳ kinh nguyệt, tăng cường sức khỏe sinh sản và cải thiện hormone.'
    },
    {
      icon: ClockIcon,
      title: 'Đặt lịch tiện lợi',
      description:
        'Hệ thống đặt lịch trực tuyến 24/7 giúp bạn dễ dàng sắp xếp thời gian thăm khám theo lịch trình cá nhân.'
    }
  ])

  // Đội ngũ chuyên gia - sử dụng ConsultantList component

  // Chứng nhận và giải thưởng
  const [certifications] = useState([
    {
      icon: Shield,
      name: 'Chứng nhận ISO 9001:2015',
      issuer: 'Tổ chức Tiêu chuẩn Quốc tế',
      description: 'Đạt chuẩn hệ thống quản lý chất lượng trong lĩnh vực chăm sóc sức khỏe',
      year: '2022'
    },
    {
      icon: FileCheck,
      name: 'Giấy phép hoạt động Y tế',
      issuer: 'Bộ Y tế Việt Nam',
      description: 'Đáp ứng đầy đủ các tiêu chuẩn về cơ sở vật chất và nhân lực y tế chuyên môn',
      year: '2021'
    },
    {
      icon: Medal,
      name: 'Top 10 Phòng khám uy tín',
      issuer: 'Hiệp hội Sức khỏe Sinh sản Việt Nam',
      description: 'Được bình chọn là một trong những phòng khám chăm sóc sức khỏe sinh sản uy tín nhất',
      year: '2023'
    },
    {
      icon: Award,
      name: 'Chứng nhận đào tạo chuyên môn',
      issuer: 'Đại học Y Hà Nội',
      description: 'Đối tác đào tạo thực hành lâm sàng cho sinh viên y khoa chuyên ngành phụ sản',
      year: '2020'
    }
  ])

  // Thêm các refs và state cho animation
  const [isVisible, setIsVisible] = useState({
    story: false,
    mission: false,
    values: false,
    services: false,
    team: false,
    whyUs: false,
    certifications: false,
    contact: false
  })

  // Refs cho các section để kiểm tra khi scroll
  const storyRef = useRef(null)
  const missionRef = useRef(null)
  const valuesRef = useRef(null)
  const servicesRef = useRef(null)
  const teamRef = useRef(null)
  const whyUsRef = useRef(null)
  const certificationsRef = useRef(null)
  const contactRef = useRef(null)

  // Hiệu ứng scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.8

      if (storyRef.current && scrollPosition > storyRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, story: true }))
      }
      if (missionRef.current && scrollPosition > missionRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, mission: true }))
      }
      if (valuesRef.current && scrollPosition > valuesRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, values: true }))
      }
      if (servicesRef.current && scrollPosition > servicesRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, services: true }))
      }
      if (teamRef.current && scrollPosition > teamRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, team: true }))
      }
      if (whyUsRef.current && scrollPosition > whyUsRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, whyUs: true }))
      }
      if (certificationsRef.current && scrollPosition > certificationsRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, certifications: true }))
      }
      if (contactRef.current && scrollPosition > contactRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, contact: true }))
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Kiểm tra các phần tử visible khi component mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <Navigation />

      {/* Hero section với parallax effect */}
      <section className='py-20 bg-gradient-to-b from-primary-50 to-white relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
          <h1 className='text-4xl md:text-5xl font-bold mb-6 animate-fadeIn'>
            Về <span className='text-primary-600'>WellCare</span>
          </h1>
          <p className='text-xl text-gray-700 max-w-3xl mx-auto animate-slideUp'>
            Chăm sóc sức khỏe giới tính toàn diện - Từ phụ nữ, vì phụ nữ
          </p>
        </div>
        {/* Hiệu ứng background pattern */}
        <div className='absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none'>
          <div className='absolute top-10 left-10 w-40 h-40 rounded-full bg-primary-300 animate-float'></div>
          <div className='absolute bottom-10 right-10 w-60 h-60 rounded-full bg-primary-200 animate-floatSlow'></div>
          <div className='absolute top-40 right-40 w-20 h-20 rounded-full bg-primary-400 animate-floatReverse'></div>
        </div>
      </section>

      {/* Giới thiệu tổ chức */}
      <section ref={storyRef} className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
            <div
              className={`space-y-6 transition-all duration-1000 ${isVisible.story ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            >
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900'>
                Câu chuyện của <span className='text-primary-600'>chúng tôi</span>
              </h2>
              <p className='text-lg text-gray-600 leading-relaxed'>{companyInfo.description}</p>
              <p className='text-lg text-gray-600 leading-relaxed'>
                Ra đời từ tâm huyết của đội ngũ y bác sĩ chuyên khoa hàng đầu, WellCare phát triển với mục tiêu trở
                thành địa chỉ tin cậy đầu tiên cho phụ nữ khi có nhu cầu chăm sóc sức khỏe. Chúng tôi tạo ra một nền
                tảng y tế kết hợp công nghệ hiện đại và dịch vụ chăm sóc cá nhân hóa.
              </p>
              <div className='pt-4'>
                <div className='grid grid-cols-3 gap-6'>
                  <div className='transition-all duration-500 hover:transform hover:scale-105'>
                    <div className='text-3xl font-bold text-primary-600'>{companyInfo.yearsOfExperience}+</div>
                    <div className='text-gray-500'>Năm kinh nghiệm</div>
                  </div>
                  <div className='transition-all duration-500 hover:transform hover:scale-105'>
                    <div className='text-3xl font-bold text-primary-600'>{companyInfo.totalExperts}+</div>
                    <div className='text-gray-500'>Chuyên gia y tế</div>
                  </div>
                  <div className='transition-all duration-500 hover:transform hover:scale-105'>
                    <div className='text-3xl font-bold text-primary-600'>{companyInfo.happyClients}+</div>
                    <div className='text-gray-500'>Khách hàng tin tưởng</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`relative transition-all duration-1000 ${isVisible.story ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              <img
                src='https://res.cloudinary.com/drks7mngp/image/upload/v1753873695/Gemini_Generated_Image_puclpqpuclpqpucl_vozdgn.png'
                alt='Đội ngũ y tế WellCare'
                className='rounded-2xl shadow-xl w-full h-[455px] object-cover  transition-transform duration-700 hover:scale-[1.02]'
              />
            </div>
          </div>

          {/* Sứ mệnh */}
          <div
            ref={missionRef}
            className={`text-center mb-16 py-10 px-6 bg-primary-50 rounded-3xl transition-all duration-1000 transform ${isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h3 className='text-3xl font-bold text-gray-900 mb-6'>
              Sứ mệnh của <span className='text-primary-600'>chúng tôi</span>
            </h3>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
              {companyInfo.mission} Chúng tôi tin rằng mỗi phụ nữ đều xứng đáng được tiếp cận với dịch vụ y tế chất
              lượng cao và được tôn trọng trong mọi giai đoạn của cuộc sống.
            </p>
          </div>

          {/* Giá trị cốt lõi */}
          <div ref={valuesRef} className='mb-20'>
            <h3
              className={`text-3xl font-bold text-gray-900 mb-10 text-center transition-all duration-700 ${isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              Giá trị <span className='text-primary-600'>cốt lõi</span>
            </h3>
            <div className='grid md:grid-cols-3 gap-8'>
              {values.map((value, index) => (
                <Card
                  key={index}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 ${isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <CardContent className='p-8 text-center'>
                    <div className='w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-500 hover:rotate-6'>
                      <value.icon className='w-8 h-8 text-white' />
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-4'>{value.title}</h4>
                    <p className='text-gray-600 leading-relaxed'>{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dịch vụ */}
      <section ref={servicesRef} className='py-16 bg-gray-50 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Dịch vụ <span className='text-primary-600'>của chúng tôi</span>
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              WellCare cung cấp đa dạng các dịch vụ chăm sóc sức khỏe giới tính, được thiết kế riêng biệt để đáp ứng nhu
              cầu của từng khách hàng.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {services.map((service, index) => (
              <Card
                key={index}
                className={`border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-2 ${isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className='p-6'>
                  <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 transition-all duration-500 hover:bg-primary-200'>
                    <service.icon className='w-6 h-6 text-primary-600' />
                  </div>
                  <h4 className='text-lg font-semibold text-gray-900 mb-3'>{service.title}</h4>
                  <p className='text-gray-600'>{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Hiệu ứng background */}
        <div className='absolute bottom-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-20 -mb-20 opacity-70'></div>
        <div className='absolute top-10 left-10 w-32 h-32 bg-primary-100 rounded-full -ml-10 -mt-10 opacity-50'></div>
      </section>

      {/* Đội ngũ */}
      <section ref={teamRef} className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Đội ngũ <span className='text-primary-600'>chuyên gia</span>
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              WellCare tự hào với đội ngũ y bác sĩ chuyên khoa giàu kinh nghiệm và tận tâm, luôn đặt sức khỏe của khách
              hàng lên hàng đầu.
            </p>
          </div>

          {/* Sử dụng ConsultantList component */}
          <div
            className={`transition-all duration-700 ${
              isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <ConsultantList showBookingButton={true} className='consultant-list-about' cardClassName='bg-white' />
          </div>
        </div>
      </section>

      {/* Tại sao chọn chúng tôi */}
      <section ref={whyUsRef} className='py-16 bg-primary-50 relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Tại sao chọn <span className='text-primary-600'>WellCare</span>?
            </h2>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            <div
              className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${isVisible.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <h4 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <CheckCircle className='w-6 h-6 text-primary-600 mr-2 transition-transform duration-500 hover:scale-110' />
                Công nghệ hiện đại
              </h4>
              <p className='text-gray-600 ml-8'>
                Áp dụng các công nghệ y tế tiên tiến nhất trong chẩn đoán và điều trị, đảm bảo kết quả chính xác và hiệu
                quả cao.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${isVisible.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <h4 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <CheckCircle className='w-6 h-6 text-primary-600 mr-2 transition-transform duration-500 hover:scale-110' />
                Chăm sóc toàn diện
              </h4>
              <p className='text-gray-600 ml-8'>
                Từ tư vấn, khám sàng lọc đến điều trị chuyên sâu, chúng tôi cung cấp giải pháp toàn diện cho sức khỏe
                giới tính của bạn.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${isVisible.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <h4 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <CheckCircle className='w-6 h-6 text-primary-600 mr-2 transition-transform duration-500 hover:scale-110' />
                Bảo mật thông tin
              </h4>
              <p className='text-gray-600 ml-8'>
                Mọi thông tin cá nhân và y tế của bạn đều được bảo mật tuyệt đối theo tiêu chuẩn quốc tế.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${isVisible.whyUs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '400ms' }}
            >
              <h4 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <CheckCircle className='w-6 h-6 text-primary-600 mr-2 transition-transform duration-500 hover:scale-110' />
                Chăm sóc cá nhân hóa
              </h4>
              <p className='text-gray-600 ml-8'>
                Mỗi khách hàng đều nhận được phác đồ chăm sóc và điều trị được thiết kế riêng, phù hợp với tình trạng
                sức khỏe cá nhân.
              </p>
            </div>
          </div>
        </div>
        {/* Hiệu ứng background */}
        <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
          <div className='absolute top-20 right-10 w-32 h-32 rounded-full bg-primary-200 opacity-50'></div>
          <div className='absolute bottom-10 left-20 w-48 h-48 rounded-full bg-primary-200 opacity-30'></div>
        </div>
      </section>

      {/* Chứng nhận và Giải thưởng */}
      <section ref={certificationsRef} className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.certifications ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Chứng nhận & <span className='text-primary-600'>Giải thưởng</span>
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              WellCare tự hào đạt được nhiều chứng nhận uy tín trong ngành y tế, đảm bảo chất lượng dịch vụ và sự an tâm
              cho khách hàng.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {certifications.map((cert, index) => (
              <div
                key={index}
                className={`bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-500 hover:-translate-y-2 ${isVisible.certifications ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className='p-6'>
                  <div className='w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 hover:rotate-12'>
                    <cert.icon className='w-6 h-6 text-primary-600' />
                  </div>
                  <h4 className='text-lg font-semibold text-gray-900 mb-2'>{cert.name}</h4>
                  <p className='text-primary-600 text-sm font-medium mb-3'>
                    {cert.issuer} • {cert.year}
                  </p>
                  <p className='text-gray-600 text-sm'>{cert.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-12 text-center'>
            <div
              className={`inline-flex items-center px-6 py-3 bg-primary-50 rounded-xl transition-all duration-700 ${isVisible.certifications ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ transitionDelay: '500ms' }}
            >
              <Shield className='w-5 h-5 text-primary-600 mr-2' />
              <span className='text-gray-700'>Tất cả chứng nhận đều được công nhận và có giá trị pháp lý</span>
            </div>
          </div>
        </div>
      </section>

      <PreFooter contactRef={contactRef} isVisible={isVisible} />

      <Footer />
      <ChatBot />

      {/* Thêm CSS cho animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatSlow {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes floatReverse {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(15px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 1.2s ease-out 0.3s both;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }

        .animate-floatReverse {
          animation: floatReverse 7s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}

export default AboutPage
