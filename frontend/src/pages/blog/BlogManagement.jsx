import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, Edit, Trash2, Eye, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Cấu hình axios với baseURL và headers mặc định
const api = axios.create({
  baseURL: 'https://localhost:7195', // Thay đổi URL này theo API của bạn
  headers: {
    'Content-Type': 'application/json'
  }
})

const BlogManagement = () => {
  const { toast } = useToast()
  const [blogPosts, setBlogPosts] = useState([])
  const [isFetchingBlogs, setIsFetchingBlogs] = useState(true)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    categoryId: ''
  })
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Lấy danh sách categories và blogs khi component mount
  useEffect(() => {
    fetchCategories()
    fetchPublishedBlogs()
  }, [])

  // Hàm lấy danh sách blogs đã xuất bản từ API
  async function fetchPublishedBlogs() {
    try {
      setIsFetchingBlogs(true)
      const response = await api.get('/api/Blog/published')
      console.log('Published blogs from API:', response.data)

      // Transform the API response to match our blogPosts structure
      const formattedPosts = response.data.map((blog) => ({
        id: blog.blogId,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        image: blog.featuredImageUrl,
        status: blog.isPublished ? 'published' : 'draft',
        author: blog.authorName || 'Staff',
        date: new Date(blog.createdAt).toISOString().split('T')[0],
        categoryId: blog.categoryId,
        categoryName: blog.categoryName || 'Không xác định'
      }))

      setBlogPosts(formattedPosts)
    } catch (error) {
      console.error('Error fetching published blogs:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách bài viết',
        variant: 'destructive'
      })
    } finally {
      setIsFetchingBlogs(false)
    }
  }

  // Hàm lấy danh sách categories từ API
  async function fetchCategories() {
    try {
      setIsLoading(true)
      const response = await api.get('/api/BlogCategory')
      console.log('Categories from API:', response.data)

      setCategories(response.data)

      // Nếu có danh mục, set categoryId mặc định là danh mục đầu tiên
      if (response.data && response.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: response.data[0].categoryId
        }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lấy danh sách danh mục',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : ''
    })
    setEditingPost(null)
    setShowCreateForm(false)
  }

  async function handleCreatePost(isDraft = false) {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ tiêu đề và nội dung',
        variant: 'destructive'
      })
      return
    }

    if (!formData.categoryId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn danh mục',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Tạo slug từ title
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')

      // Chuẩn bị dữ liệu để gửi lên API
      const postData = {
        title: formData.title,
        slug: slug,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        authorId: 'E37EB746-045B-475E-80DF-0C0B2A38C772', // AuthorId đã xác nhận hợp lệ
        categoryId: formData.categoryId,
        featuredImageUrl:
          formData.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
        isPublished: !isDraft
      }

      console.log('Sending data to API:', postData)

      // Gọi API để tạo bài viết mới
      const response = await api.post('/api/Blog', postData)
      console.log('API response:', response.data)

      // Cập nhật state với bài viết mới
      const newPost = {
        id: response.data.blogId || Date.now(),
        title: formData.title,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        content: formData.content,
        image: formData.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
        status: isDraft ? 'draft' : 'published',
        author: 'Staff',
        date: new Date().toISOString().split('T')[0],
        categoryName: categories.find((c) => c.categoryId === formData.categoryId)?.name || 'Không xác định'
      }

      setBlogPosts((prev) => [newPost, ...prev])

      toast({
        title: 'Thành công',
        description: isDraft ? 'Bài viết đã được lưu vào nháp' : 'Bài viết đã được xuất bản'
      })

      resetForm()
    } catch (error) {
      console.error('Error creating post:', error)

      if (error.response && error.response.data) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }

      toast({
        title: 'Lỗi',
        description: 'Không thể tạo bài viết: ' + (error.response?.data?.message || error.message),
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePost(isDraft = false) {
    if (!editingPost || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      })
      return
    }

    if (!formData.categoryId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn danh mục',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Tạo slug từ title
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')

      // Chuẩn bị dữ liệu để gửi lên API
      const postData = {
        blogId: editingPost.id,
        title: formData.title,
        slug: slug,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        authorId: 'E37EB746-045B-475E-80DF-0C0B2A38C772',
        categoryId: formData.categoryId,
        featuredImageUrl:
          formData.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
        isPublished: !isDraft
      }

      console.log('Sending update data to API:', postData)

      // Gọi API để cập nhật bài viết
      const response = await api.put(`/api/Blog/${editingPost.id}`, postData)
      console.log('Update API response:', response.data)

      // Cập nhật state
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: formData.title,
                excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
                content: formData.content,
                image:
                  formData.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
                status: isDraft ? 'draft' : 'published',
                categoryName: categories.find((c) => c.categoryId === formData.categoryId)?.name || 'Không xác định'
              }
            : post
        )
      )

      toast({
        title: 'Thành công',
        description: 'Bài viết đã được cập nhật'
      })

      resetForm()
    } catch (error) {
      console.error('Error updating post:', error)

      if (error.response && error.response.data) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      }

      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật bài viết: ' + (error.response?.data?.message || error.message),
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditPost(post) {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      categoryId: post.categoryId || (categories.length > 0 ? categories[0].categoryId : '')
    })
    setShowCreateForm(true)
  }

  async function handleDeletePost(id) {
    // Confirm deletion with user
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      return
    }

    setIsLoading(true)
    try {
      console.log(`Deleting blog post with ID: ${id}`)

      // Gọi API để xóa bài viết
      const response = await api.delete(`/api/Blog/${id}`)
      console.log('Delete API response:', response.data)

      // Cập nhật state để xóa bài viết khỏi danh sách
      setBlogPosts((prev) => prev.filter((post) => post.id !== id))

      toast({
        title: 'Đã xóa',
        description: 'Bài viết đã được xóa thành công'
      })

      // Nếu đang chỉnh sửa bài viết bị xóa, reset form
      if (editingPost && editingPost.id === id) {
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting post:', error)

      if (error.response && error.response.data) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      }

      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bài viết: ' + (error.response?.data?.message || error.message),
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusBadge(status) {
    return status === 'published' ? (
      <Badge className='bg-green-100 text-green-800'>Đã xuất bản</Badge>
    ) : (
      <Badge className='bg-yellow-100 text-yellow-800'>Nháp</Badge>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Quản lý Blog</h1>
          <p className='text-gray-600 mt-2'>Tạo và chỉnh sửa bài viết blog cho WellCare</p>
        </div>

        {/* Blog Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6 text-center'>
              <FileText className='h-8 w-8 text-blue-500 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-900'>{blogPosts.length}</p>
              <p className='text-gray-600'>Tổng bài viết</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6 text-center'>
              <Eye className='h-8 w-8 text-green-500 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-900'>
                {blogPosts.filter((post) => post.status === 'published').length}
              </p>
              <p className='text-gray-600'>Đã xuất bản</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6 text-center'>
              <Edit className='h-8 w-8 text-yellow-500 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-900'>
                {blogPosts.filter((post) => post.status === 'draft').length}
              </p>
              <p className='text-gray-600'>Bản nháp</p>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Form */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>Danh sách bài viết</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className='bg-gradient-primary'>
            <PlusCircle className='h-4 w-4 mr-2' />
            Tạo bài viết mới
          </Button>
        </div>

        {showCreateForm && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</CardTitle>
              <CardDescription>
                {editingPost ? 'Cập nhật thông tin bài viết' : 'Thêm bài viết mới cho blog WellCare'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Tiêu đề bài viết</Label>
                <Input
                  id='title'
                  placeholder='Nhập tiêu đề bài viết'
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Danh mục</Label>
                <select
                  id='category'
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  disabled={isLoading || categories.length === 0}
                >
                  {categories.length === 0 ? (
                    <option value=''>Đang tải danh mục...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='image'>URL ảnh minh họa</Label>
                <Input
                  id='image'
                  placeholder='https://example.com/image.jpg'
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excerpt'>Mô tả ngắn</Label>
                <Textarea
                  id='excerpt'
                  placeholder='Mô tả ngắn về nội dung bài viết'
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content'>Nội dung</Label>
                <Textarea
                  id='content'
                  className='min-h-[200px]'
                  placeholder='Nội dung chi tiết của bài viết'
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className='flex space-x-4'>
                {editingPost ? (
                  <>
                    <Button
                      onClick={() => handleUpdatePost(false)}
                      className='bg-gradient-primary'
                      disabled={isLoading || categories.length === 0}
                    >
                      {isLoading ? 'Đang xử lý...' : 'Cập nhật & Xuất bản'}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => handleUpdatePost(true)}
                      disabled={isLoading || categories.length === 0}
                    >
                      {isLoading ? 'Đang xử lý...' : 'Lưu nháp'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleCreatePost(false)}
                      className='bg-gradient-primary'
                      disabled={isLoading || categories.length === 0}
                    >
                      {isLoading ? 'Đang xử lý...' : 'Xuất bản'}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => handleCreatePost(true)}
                      disabled={isLoading || categories.length === 0}
                    >
                      {isLoading ? 'Đang xử lý...' : 'Lưu nháp'}
                    </Button>
                  </>
                )}
                <Button variant='ghost' onClick={resetForm} disabled={isLoading}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Posts List */}
        <div className='space-y-4'>
          {isFetchingBlogs ? (
            <Card>
              <CardContent className='p-6 text-center'>
                <p>Đang tải dữ liệu bài viết...</p>
              </CardContent>
            </Card>
          ) : blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className='p-6'>
                  <div className='flex justify-between items-start'>
                    <div className='flex space-x-4 flex-1'>
                      {post.image && (
                        <img src={post.image} alt={post.title} className='w-24 h-24 rounded-lg object-cover' />
                      )}
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-xl font-semibold text-gray-900'>{post.title}</h3>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className='text-gray-600 mb-4'>{post.excerpt}</p>
                        <div className='flex items-center space-x-4 text-sm text-gray-500'>
                          <span>Tác giả: {post.author}</span>
                          <span>Ngày: {post.date}</span>
                          {post.categoryName && <span>Danh mục: {post.categoryName}</span>}
                        </div>
                      </div>
                    </div>

                    <div className='flex space-x-2 ml-4'>
                      <Button size='sm' variant='outline'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => handleEditPost(post)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='text-red-600 hover:text-red-700'
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className='p-6 text-center'>
                <p>Chưa có bài viết nào được xuất bản</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogManagement
