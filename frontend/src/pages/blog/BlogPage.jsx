import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'

// Cấu hình axios với baseURL và headers mặc định
const api = axios.create({
  baseURL: 'https://localhost:7195',
  headers: {
    'Content-Type': 'application/json'
  }
})

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Lấy danh sách blog posts và categories từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Lấy danh sách bài viết
        const blogsResponse = await api.get('/api/Blog/published')
        const formattedPosts = blogsResponse.data.map((blog) => ({
          id: blog.blogId,
          title: blog.title,
          excerpt: blog.excerpt || blog.content.substring(0, 150) + '...',
          content: blog.content,
          author: blog.authorName || 'WellCare Staff',
          date: new Date(blog.createdAt).toISOString().split('T')[0],
          image:
            blog.featuredImageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
          category: blog.categoryName || 'Chưa phân loại',
          categoryId: blog.categoryId
        }))
        setBlogPosts(formattedPosts)

        // Lấy danh sách danh mục trực tiếp từ API
        const categoriesResponse = await api.get('/api/BlogCategory')
        const categoryOptions = ['Tất cả', ...categoriesResponse.data.map((cat) => cat.name)]
        setCategories(categoryOptions)

        setError(null)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter posts by category
  const filteredPosts =
    selectedCategory === 'Tất cả' ? blogPosts : blogPosts.filter((post) => post.category === selectedCategory)

  return (
    <div className='min-h-screen'>
      <Navigation />

      {/* Hero Section */}
      <section className='bg-gradient-soft py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
            <span className='gradient-text'>Blog</span> sức khỏe
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Kiến thức và tips hữu ích về sức khỏe giới tính từ đội ngũ chuyên gia
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className='py-6 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap gap-3 justify-center'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                className={category === selectedCategory ? 'bg-gradient-primary text-white' : ''}
                size='sm'
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin mb-4'>
                <Loader size={40} className='text-primary-500' />
              </div>
              <p className='text-gray-600'>Đang tải bài viết...</p>
            </div>
          ) : error ? (
            <div className='text-center p-12 bg-red-50 rounded-lg'>
              <p className='text-red-600'>{error}</p>
              <Button onClick={() => window.location.reload()} variant='outline' className='mt-4'>
                Thử lại
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className='text-center p-12 bg-gray-50 rounded-lg'>
              <p className='text-gray-600'>Không có bài viết nào trong mục này.</p>
            </div>
          ) : (
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-6 animate-fade-in'>
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'
                >
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={post.image}
                      alt={post.title}
                      className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <CardContent className='p-4'>
                    <span className='text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full'>
                      {post.category}
                    </span>
                    <h3 className='text-lg font-bold text-gray-900 mb-2 mt-3 line-clamp-2'>{post.title}</h3>
                    <p className='text-gray-600 mb-3 text-sm line-clamp-2'>{post.excerpt}</p>
                    <div className='flex items-center gap-3 text-xs text-gray-500 mb-3'>
                      <div className='flex items-center gap-1'>
                        <User className='w-3 h-3' />
                        <span>{post.author}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <Button size='sm' className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                        Đọc thêm
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default BlogPage
