import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, User, RefreshCw, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/configs/axios'
import { useToast } from '@/hooks/useToast'
import Loading from '../../../components/Loading'

const BlogPage = () => {
  const { showError, showSuccess } = useToast()
  const [blogPosts, setBlogPosts] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stable error handler với useCallback
  const handleError = useCallback(
    (message) => {
      setError(message)
      showError(message)
    },
    [showError]
  )

  // Lấy danh sách blog posts và categories từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Lấy danh sách bài viết đã xuất bản
        const blogsResponse = await api.get('/api/Blog/published')
        const formattedPosts = blogsResponse.data.map((blog) => ({
          id: blog.blogId,
          slug: blog.slug,
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

        // Lấy danh sách danh mục
        try {
          const categoriesResponse = await api.get('/api/BlogCategory')
          const categoryOptions = ['Tất cả', ...categoriesResponse.data.map((cat) => cat.name)]
          setCategories(categoryOptions)
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError)
        }

        setError(null)
      } catch (error) {
        console.error('BlogPage: Error fetching blog posts:', error)
        handleError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [handleError])

  // Filter posts by category and search text với useMemo
  const filteredPosts = useMemo(() => {
    let filtered = blogPosts

    // Filter by category
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // Filter by search text (title)
    if (searchText.trim()) {
      filtered = filtered.filter((post) => post.title.toLowerCase().includes(searchText.toLowerCase()))
    }

    return filtered
  }, [selectedCategory, blogPosts, searchText])

  // Function to clear search and filters
  const clearFilters = useCallback(() => {
    setSearchText('')
    setSelectedCategory('Tất cả')
  }, [])

  // Function to refresh blog posts
  const refreshBlogPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const blogsResponse = await api.get('/api/Blog/published')
      const formattedPosts = blogsResponse.data.map((blog) => ({
        id: blog.blogId,
        slug: blog.slug,
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

      showSuccess('Đã tải lại danh sách bài viết')
    } catch (error) {
      console.error('Error refreshing blog posts:', error)
      handleError('Không thể tải lại danh sách bài viết. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [showSuccess, handleError])

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
          {/* Search Bar */}
          <div className='mb-4 max-w-md mx-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                type='text'
                placeholder='Tìm kiếm bài viết theo tiêu đề...'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              />
            </div>
          </div>

          {/* Category Filters */}
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
            <Button variant='outline' size='sm' onClick={refreshBlogPosts} disabled={loading} className='ml-2'>
              <RefreshCw className='h-4 w-4 mr-1' />
              Làm mới
            </Button>
            {(searchText || selectedCategory !== 'Tất cả') && (
              <Button variant='outline' size='sm' onClick={clearFilters} className='ml-2'>
                <X className='h-4 w-4 mr-1' />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {loading ? (
            <Loading />
          ) : error ? (
            <div className='text-center p-12 bg-red-50 rounded-lg'>
              <p className='text-red-600'>{error}</p>
              <Button onClick={() => window.location.reload()} variant='outline' className='mt-4'>
                Thử lại
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className='text-center p-12 bg-gray-50 rounded-lg'>
              <p className='text-gray-600'>
                {searchText
                  ? `Không tìm thấy bài viết nào có tiêu đề chứa "${searchText}".`
                  : selectedCategory !== 'Tất cả'
                    ? `Không có bài viết nào trong danh mục "${selectedCategory}".`
                    : 'Không có bài viết nào.'}
              </p>
              {(searchText || selectedCategory !== 'Tất cả') && (
                <Button onClick={clearFilters} variant='outline' className='mt-4'>
                  <X className='h-4 w-4 mr-1' />
                  Xóa bộ lọc
                </Button>
              )}
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
