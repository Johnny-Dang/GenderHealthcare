import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Loader, Clock, Tag } from 'lucide-react'

// Cấu hình axios với baseURL và headers mặc định
const api = axios.create({
  baseURL: 'https://localhost:7195',
  headers: {
    'Content-Type': 'application/json'
  }
})

const BlogDetailPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Tính thời gian đọc dựa trên độ dài nội dung
  const calculateReadTime = (content) => {
    // Giả định tốc độ đọc trung bình: 200 từ/phút
    const wordCount = content.split(/\s+/).length
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
    return `${readTimeMinutes} phút đọc`
  }

  // Lấy dữ liệu blog từ API
  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!id) return

      try {
        setLoading(true)

        // Lấy tất cả các bài viết đã xuất bản
        const response = await api.get('/api/Blog/published')

        // Tìm bài viết với id tương ứng
        const blogData = response.data.find((blog) => blog.blogId.toString() === id.toString())

        if (!blogData) {
          setError('Không tìm thấy bài viết')
          return
        }

        // Tạo tags từ category và các từ khóa trong nội dung
        const tags = [blogData.categoryName]

        // Format dữ liệu blog
        const formattedPost = {
          id: blogData.blogId,
          title: blogData.title,
          content: blogData.content,
          excerpt: blogData.excerpt,
          author: blogData.authorName || 'WellCare Staff',
          date: new Date(blogData.createdAt).toISOString().split('T')[0],
          readTime: calculateReadTime(blogData.content),
          tags: tags,
          image:
            blogData.featuredImageUrl ||
            'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
          category: blogData.categoryName || 'Chưa phân loại'
        }

        setPost(formattedPost)
        setError(null)
      } catch (err) {
        console.error('Error fetching blog detail:', err)
        setError('Không thể tải bài viết. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetail()
  }, [id])

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-soft'>
        <Navigation />
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center'>
          <div className='animate-spin mb-4'>
            <Loader size={40} className='text-primary-500' />
          </div>
          <p className='text-gray-600'>Đang tải bài viết...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className='min-h-screen bg-gradient-soft'>
        <Navigation />
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center bg-white p-8 rounded-lg shadow-lg'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>{error || 'Không tìm thấy bài viết'}</h1>
            <Link to='/blog'>
              <Button className='bg-gradient-primary hover:opacity-90'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Quay lại Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-soft'>
      <Navigation />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
        <Link
          to='/blog'
          className='inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors duration-200'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại Blog
        </Link>

        <Card className='border-0 shadow-xl overflow-hidden'>
          <CardHeader className='p-0'>
            {post.image && (
              <div className='w-full h-80 overflow-hidden'>
                <img
                  src={post.image}
                  alt={post.title}
                  className='w-full h-full object-cover transform transition-transform duration-500 hover:scale-105'
                />
              </div>
            )}
          </CardHeader>

          <CardContent className='p-8'>
            <span className='inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-4'>
              {post.category}
            </span>

            <CardTitle className='text-3xl font-bold text-gray-900 mb-6'>{post.title}</CardTitle>

            <div className='flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 border-b border-gray-100 pb-6'>
              <div className='flex items-center'>
                <User className='h-4 w-4 mr-2 text-primary-500' />
                {post.author}
              </div>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 mr-2 text-primary-500' />
                {new Date(post.date).toLocaleDateString('vi-VN')}
              </div>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 mr-2 text-primary-500' />
                {post.readTime}
              </div>
            </div>

            {post.excerpt && (
              <div className='text-lg text-gray-600 font-medium italic mb-6 border-l-4 border-primary-300 pl-4'>
                {post.excerpt}
              </div>
            )}

            <div className='prose max-w-none prose-headings:text-primary-900 prose-a:text-primary-600 prose-strong:text-gray-900'>
              {/* Sử dụng dangerouslySetInnerHTML chỉ khi nội dung được sanitize */}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className='mt-8 pt-6 border-t border-gray-100'>
                <div className='flex items-center flex-wrap gap-2'>
                  <Tag className='h-4 w-4 text-gray-500 mr-2' />
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default BlogDetailPage
