import React, { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, Edit, Trash2, Eye, FileText, X, Filter, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '@/configs/axios'

// Constants
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop'

const BlogManagement = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user)
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

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewingPost, setViewingPost] = useState(null)

  // New Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })

  // Edit Category Modal state
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Delete Category Confirmation state
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategoryName, setSelectedCategoryName] = useState('')

  // Helper functions
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
  }

  const createExcerpt = (content, existingExcerpt) => {
    return existingExcerpt || content.substring(0, 150) + '...'
  }

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.categoryId === categoryId)?.name || 'Không xác định'
  }

  const validateForm = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ tiêu đề và nội dung',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.categoryId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn danh mục',
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleApiError = (error, actionMessage) => {
    console.error(`Error ${actionMessage}:`, error)

    let errorDetails = error.message
    if (error.response && error.response.data) {
      errorDetails = error.response.data.message || errorDetails
    }

    toast({
      title: 'Lỗi',
      description: `Không thể ${actionMessage}: ${errorDetails}`,
      variant: 'destructive'
    })
  }

  // Use useMemo to filter blog posts based on selectedCategoryName
  const filteredBlogPosts = useMemo(() => {
    if (!selectedCategoryName) {
      return blogPosts
    }
    // Filter by categoryName instead of categoryId
    return blogPosts.filter((post) => post.categoryName === selectedCategoryName)
  }, [blogPosts, selectedCategoryName])

  // Lấy danh sách categories và blogs khi component mount
  useEffect(() => {
    // Chỉ cho phép user đã đăng nhập và có role phù hợp truy cập
    if (!user) {
      toast({
        title: 'Không có quyền truy cập',
        description: 'Bạn cần đăng nhập để quản lý blog',
        variant: 'destructive'
      })
      navigate('/login')
      return
    }

    if (user && user.role !== 'Staff' && user.role !== 'Admin') {
      toast({
        title: 'Không có quyền truy cập',
        description: 'Bạn không có quyền quản lý blog',
        variant: 'destructive'
      })
      navigate('/')
      return
    }

    fetchCategories()
    fetchPublishedBlogs()
  }, [user, navigate])

  // Hàm lấy danh sách blogs đã xuất bản từ API
  async function fetchPublishedBlogs() {
    try {
      setIsFetchingBlogs(true)
      const response = await api.get('/api/Blog/published')

      // Transform the API response to match our blogPosts structure
      const formattedPosts = response.data.map((blog) => ({
        id: blog.blogId,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        image: blog.featuredImageUrl,
        status: blog.isPublished ? 'published' : 'draft',
        author: blog.authorName || user?.fullName || user?.username || 'Staff',
        date: new Date(blog.createdAt).toISOString().split('T')[0],
        categoryId: blog.categoryId,
        categoryName: blog.categoryName || 'Không xác định'
      }))

      setBlogPosts(formattedPosts)
    } catch (error) {
      handleApiError(error, 'tải danh sách bài viết')
    } finally {
      setIsFetchingBlogs(false)
    }
  }

  // Hàm lấy danh sách categories từ API
  async function fetchCategories() {
    try {
      setIsLoading(true)
      const response = await api.get('/api/BlogCategory')
      setCategories(response.data)

      // Nếu có danh mục, set categoryId mặc định là danh mục đầu tiên
      if (response.data && response.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: response.data[0].categoryId
        }))
      }
    } catch (error) {
      handleApiError(error, 'lấy danh sách danh mục')
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
    setShowEditModal(false)
  }

  // Prepare blog post data for API
  const preparePostData = (isUpdate = false, isDraft = false) => {
    const slug = generateSlug(formData.title)
    const excerpt = createExcerpt(formData.content, formData.excerpt)

    const postData = {
      title: formData.title,
      slug: slug,
      content: formData.content,
      excerpt: excerpt,
      authorId: user?.accountId || user?.id, // Sử dụng ID người dùng đã đăng nhập
      categoryId: formData.categoryId,
      featuredImageUrl: formData.image || DEFAULT_IMAGE,
      isPublished: !isDraft
    }

    if (isUpdate && editingPost) {
      postData.blogId = editingPost.id
    }

    // Log để debug
    console.log('Sending blog data:', postData)

    return postData
  }

  // Format post data for local state
  const formatPostForState = (postData, responseData = {}, isDraft = false) => {
    return {
      id: responseData.blogId || Date.now(),
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      image: postData.featuredImageUrl,
      status: isDraft ? 'draft' : 'published',
      author: user?.fullName || user?.username || 'Staff',
      date: new Date().toISOString().split('T')[0],
      categoryId: postData.categoryId,
      categoryName: getCategoryName(postData.categoryId)
    }
  }

  async function handleCreatePost(isDraft = false) {
    if (!validateForm()) return

    // Kiểm tra user ID
    if (!user || (!user.accountId && !user.id)) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xác định người tạo bài viết. Vui lòng đăng nhập lại.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const postData = preparePostData(false, isDraft)

      const response = await api.post('/api/Blog', postData)
      const newPost = formatPostForState(postData, response.data, isDraft)

      setBlogPosts((prev) => [newPost, ...prev])

      toast({
        title: 'Thành công',
        description: isDraft ? 'Bài viết đã được lưu vào nháp' : 'Bài viết đã được xuất bản'
      })

      resetForm()
    } catch (error) {
      handleApiError(error, 'tạo bài viết')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdatePost(isDraft = false) {
    if (!editingPost || !validateForm()) return

    setIsLoading(true)
    try {
      const postData = preparePostData(true, isDraft)

      await api.put(`/api/Blog/${editingPost.id}`, postData)

      // Cập nhật state
      setBlogPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id ? formatPostForState(postData, { blogId: post.id }, isDraft) : post
        )
      )

      toast({
        title: 'Thành công',
        description: 'Bài viết đã được cập nhật'
      })

      resetForm()
    } catch (error) {
      handleApiError(error, 'cập nhật bài viết')
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
    setShowEditModal(true)
  }

  async function handleDeletePost(id) {
    // Confirm deletion with user
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      return
    }

    setIsLoading(true)
    try {
      await api.delete(`/api/Blog/${id}`)

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
      handleApiError(error, 'xóa bài viết')
    } finally {
      setIsLoading(false)
    }
  }

  function handleViewDetail(post) {
    setViewingPost(post)
    setShowDetailModal(true)
  }

  function closeDetailModal() {
    setShowDetailModal(false)
    setViewingPost(null)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditingPost(null)
    resetForm()
  }

  // Function to handle category filter change
  function handleCategoryFilter(categoryId) {
    if (!categoryId) {
      clearFilter()
      return
    }

    // Tìm category tương ứng để lấy tên
    const selectedCategory = categories.find((cat) => String(cat.categoryId) === String(categoryId))

    if (selectedCategory) {
      setSelectedCategoryId(categoryId)
      setSelectedCategoryName(selectedCategory.name)
    } else {
      clearFilter()
    }
  }

  // Function to clear the filter
  function clearFilter() {
    setSelectedCategoryId('')
    setSelectedCategoryName('')
  }

  function getStatusBadge(status) {
    return status === 'published' ? (
      <Badge className='bg-green-100 text-green-800'>Đã xuất bản</Badge>
    ) : (
      <Badge className='bg-yellow-100 text-yellow-800'>Nháp</Badge>
    )
  }

  // Hàm tạo mới danh mục
  async function handleCreateCategory() {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên danh mục',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/api/BlogCategory', {
        name: newCategory.name,
        description: newCategory.description
      })

      // Thêm danh mục mới vào danh sách
      const createdCategory = response.data
      setCategories((prev) => [...prev, createdCategory])

      // Chọn danh mục mới làm category hiện tại cho form
      setFormData((prev) => ({
        ...prev,
        categoryId: createdCategory.categoryId
      }))

      toast({
        title: 'Thành công',
        description: 'Đã tạo danh mục mới'
      })

      // Reset form và đóng modal
      setNewCategory({ name: '', description: '' })
      setShowCategoryModal(false)
    } catch (error) {
      handleApiError(error, 'tạo danh mục mới')
    } finally {
      setIsLoading(false)
    }
  }

  // Mở modal chỉnh sửa danh mục
  function openEditCategoryModal(category) {
    setEditingCategory({
      categoryId: category.categoryId,
      name: category.name,
      description: category.description || ''
    })
    setShowEditCategoryModal(true)
  }

  // Hàm cập nhật danh mục
  async function handleUpdateCategory() {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên danh mục',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.put(`/api/BlogCategory/${editingCategory.categoryId}`, {
        categoryId: editingCategory.categoryId,
        name: editingCategory.name,
        description: editingCategory.description
      })

      // Cập nhật danh mục trong danh sách
      const updatedCategory = response.data
      setCategories((prev) =>
        prev.map((cat) => (cat.categoryId === updatedCategory.categoryId ? updatedCategory : cat))
      )

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật danh mục'
      })

      // Đóng modal
      setEditingCategory(null)
      setShowEditCategoryModal(false)
    } catch (error) {
      handleApiError(error, 'cập nhật danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  // Mở xác nhận xóa danh mục
  function openDeleteCategoryConfirm(category) {
    setCategoryToDelete(category)
    setShowDeleteCategoryConfirm(true)
  }

  // Hàm xóa danh mục
  async function handleDeleteCategory() {
    if (!categoryToDelete) return

    setIsLoading(true)
    try {
      // Kiểm tra xem danh mục có bài viết nào không
      const hasBlogPosts = blogPosts.some((post) => post.categoryId === categoryToDelete.categoryId)

      if (hasBlogPosts) {
        toast({
          title: 'Không thể xóa',
          description:
            'Không thể xóa danh mục này vì vẫn còn bài viết thuộc danh mục. Vui lòng xóa hoặc chuyển bài viết sang danh mục khác trước.',
          variant: 'destructive'
        })
        closeDeleteCategoryConfirm()
        return
      }

      await api.delete(`/api/BlogCategory/${categoryToDelete.categoryId}`)

      // Xóa danh mục khỏi danh sách
      setCategories((prev) => prev.filter((cat) => cat.categoryId !== categoryToDelete.categoryId))

      // Nếu đang chọn danh mục bị xóa thì reset bộ lọc
      if (selectedCategoryId === categoryToDelete.categoryId) {
        clearFilter()
      }

      // Nếu form đang chọn danh mục bị xóa thì chọn danh mục đầu tiên hoặc để trống
      if (formData.categoryId === categoryToDelete.categoryId) {
        setFormData((prev) => ({
          ...prev,
          categoryId:
            categories.length > 1
              ? categories.find((c) => c.categoryId !== categoryToDelete.categoryId)?.categoryId || ''
              : ''
        }))
      }

      toast({
        title: 'Thành công',
        description: 'Đã xóa danh mục'
      })

      // Đóng modal xác nhận
      setCategoryToDelete(null)
      setShowDeleteCategoryConfirm(false)
    } catch (error) {
      handleApiError(error, 'xóa danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to close the category modal
  function closeCategoryModal() {
    setShowCategoryModal(false)
    setNewCategory({ name: '', description: '' })
  }

  // Đóng modal chỉnh sửa danh mục
  function closeEditCategoryModal() {
    setShowEditCategoryModal(false)
    setEditingCategory(null)
  }

  // Đóng modal xác nhận xóa danh mục
  function closeDeleteCategoryConfirm() {
    setShowDeleteCategoryConfirm(false)
    setCategoryToDelete(null)
  }

  return (
    <div className='min-h-screen bg-gradient-soft'>
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Quản lý Blog</h1>
          <p className='text-gray-600 mt-2'>Tạo và chỉnh sửa bài viết blog cho WellCare</p>
        </div>

        {/* Blog Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <CardContent className='p-6 text-center'>
              <FileText className='h-8 w-8 text-blue-500 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-900'>{blogPosts.length}</p>
              <p className='text-gray-600'>Tổng bài viết</p>
            </CardContent>
          </Card>
          <Card className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
            <CardContent className='p-6 text-center'>
              <Eye className='h-8 w-8 text-green-500 mx-auto mb-2' />
              <p className='text-2xl font-bold text-gray-900'>
                {blogPosts.filter((post) => post.status === 'published').length}
              </p>
              <p className='text-gray-600'>Đã xuất bản</p>
            </CardContent>
          </Card>
          <Card className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
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
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className='bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            <PlusCircle className='h-4 w-4 mr-2' />
            Tạo bài viết mới
          </Button>
        </div>

        {showCreateForm && (
          <Card className='mb-6 border-0 shadow-lg animate-fade-in'>
            <CardHeader>
              <CardTitle>Tạo bài viết mới</CardTitle>
              <CardDescription>Thêm bài viết mới cho blog WellCare</CardDescription>
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
                <div className='flex justify-between items-center'>
                  <Label htmlFor='category'>Danh mục</Label>
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    className='text-primary-500 hover:text-primary-600 hover:bg-primary-50'
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <PlusCircle className='h-4 w-4 mr-1' />
                    Thêm danh mục
                  </Button>
                </div>
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
                <Button
                  onClick={() => handleCreatePost(false)}
                  className='bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg'
                  disabled={isLoading || categories.length === 0}
                >
                  {isLoading ? 'Đang xử lý...' : 'Xuất bản'}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleCreatePost(true)}
                  disabled={isLoading || categories.length === 0}
                  className='hover:bg-gray-50 transition-colors duration-300'
                >
                  {isLoading ? 'Đang xử lý...' : 'Lưu nháp'}
                </Button>
                <Button
                  variant='ghost'
                  onClick={resetForm}
                  disabled={isLoading}
                  className='hover:bg-red-50 hover:text-red-600 transition-colors duration-300'
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <Card className='mb-6 border-0 shadow-md hover:shadow-lg transition-all duration-300'>
          <CardContent className='p-4'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='flex items-center'>
                <Filter className='h-5 w-5 text-gray-500 mr-2' />
                <span className='font-medium text-gray-700'>Lọc bài viết theo danh mục:</span>
              </div>

              <div className='flex flex-1 sm:max-w-xs'>
                <select
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none'
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  disabled={isLoading || categories.length === 0}
                >
                  <option value=''>Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={clearFilter}
                  disabled={!selectedCategoryId}
                  className='transition-all duration-300 hover:bg-gray-50'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Xóa bộ lọc
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowCategoryModal(true)}
                  className='transition-all duration-300 hover:bg-primary-50'
                >
                  <PlusCircle className='h-4 w-4 mr-2' />
                  Thêm danh mục
                </Button>
              </div>
            </div>

            {selectedCategoryId && (
              <div className='mt-2 text-sm text-gray-500 flex justify-between items-center'>
                <span>
                  Đang hiển thị {filteredBlogPosts.length} bài viết trong danh mục{' '}
                  <span className='font-medium'>
                    {categories.find((cat) => cat.categoryId === selectedCategoryId)?.name || 'Không xác định'}
                  </span>
                </span>

                {selectedCategoryId && (
                  <div className='flex space-x-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const category = categories.find((cat) => cat.categoryId === selectedCategoryId)
                        if (category) openEditCategoryModal(category)
                      }}
                      className='text-blue-600 hover:text-blue-800 px-2'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const category = categories.find((cat) => cat.categoryId === selectedCategoryId)
                        if (category) openDeleteCategoryConfirm(category)
                      }}
                      className='text-red-600 hover:text-red-800 px-2'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <div className='space-y-4'>
          {isFetchingBlogs ? (
            <Card className='border-0 shadow-lg'>
              <CardContent className='p-6 text-center'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <div className='w-12 h-12 border-4 border-t-primary-500 border-primary-200 rounded-full animate-spin mb-4'></div>
                  <p>Đang tải dữ liệu bài viết...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredBlogPosts.length > 0 ? (
            filteredBlogPosts.map((post, index) => (
              <Card
                key={post.id}
                className='border-0 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className='p-6'>
                  <div className='flex justify-between items-start'>
                    <div className='flex space-x-4 flex-1'>
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className='w-24 h-24 rounded-lg object-cover shadow-md hover:scale-105 transition-transform duration-300'
                        />
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
                          {post.categoryName && (
                            <span
                              className='cursor-pointer hover:text-blue-600 transition-colors duration-300 hover:underline'
                              onClick={() => {
                                const categoryId = categories.find((cat) => cat.name === post.categoryName)?.categoryId
                                if (categoryId) handleCategoryFilter(categoryId)
                                else console.log('Không tìm thấy categoryId cho:', post.categoryName)
                              }}
                            >
                              Danh mục: {post.categoryName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex space-x-2 ml-4'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleViewDetail(post)}
                        className='hover:bg-blue-50 hover:text-blue-600 transition-all duration-300'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditPost(post)}
                        className='hover:bg-green-50 hover:text-green-600 transition-all duration-300'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeletePost(post.id)}
                        className='text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className='border-0 shadow-lg animate-fade-in'>
              <CardContent className='p-6 text-center'>
                <p>
                  {selectedCategoryId
                    ? 'Không tìm thấy bài viết nào trong danh mục này'
                    : 'Chưa có bài viết nào được xuất bản'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Detail Modal */}
      {showDetailModal && viewingPost && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in'>
          <div
            className='bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in transform transition-all duration-300'
            style={{ animationDelay: '0.15s' }}
          >
            <div className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold text-gray-900'>Chi tiết bài viết</h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={closeDetailModal}
                  className='rounded-full h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-colors duration-300'
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>

              <div className='space-y-6'>
                {/* Title and status */}
                <div className='flex items-center gap-3'>
                  <h1 className='text-3xl font-bold text-gray-900'>{viewingPost.title}</h1>
                  {getStatusBadge(viewingPost.status)}
                </div>

                {/* Featured image */}
                {viewingPost.image && (
                  <div className='w-full flex justify-center'>
                    <img
                      src={viewingPost.image}
                      alt={viewingPost.title}
                      className='rounded-lg max-h-[400px] object-cover'
                    />
                  </div>
                )}

                {/* Meta information */}
                <div className='flex flex-wrap gap-4 text-gray-500 text-sm'>
                  <div className='flex items-center'>
                    <span className='font-medium mr-2'>Tác giả:</span> {viewingPost.author}
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium mr-2'>Ngày đăng:</span> {viewingPost.date}
                  </div>
                  <div className='flex items-center'>
                    <span className='font-medium mr-2'>Danh mục:</span> {viewingPost.categoryName}
                  </div>
                </div>

                {/* Excerpt */}
                {viewingPost.excerpt && (
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Tóm tắt:</h3>
                    <div className='bg-gray-50 p-4 rounded-md italic'>{viewingPost.excerpt}</div>
                  </div>
                )}

                {/* Content */}
                <div>
                  <h3 className='text-lg font-medium mb-2'>Nội dung:</h3>
                  <div className='bg-gray-50 p-4 rounded-md whitespace-pre-wrap'>{viewingPost.content}</div>
                </div>
              </div>

              <div className='mt-6 flex justify-end space-x-4'>
                <Button
                  variant='outline'
                  onClick={() => {
                    handleEditPost(viewingPost)
                    closeDetailModal()
                  }}
                  className='hover:bg-green-50 hover:text-green-600 transition-all duration-300'
                >
                  <Edit className='h-4 w-4 mr-2' /> Chỉnh sửa
                </Button>
                <Button
                  onClick={closeDetailModal}
                  className='bg-gradient-primary hover:opacity-90 transition-all duration-300'
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPost && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in'>
          <div
            className='bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in transform transition-all duration-300'
            style={{ animationDelay: '0.15s' }}
          >
            <div className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-bold text-gray-900'>Chỉnh sửa bài viết</h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={closeEditModal}
                  className='rounded-full h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-colors duration-300'
                >
                  <X className='h-5 w-5' />
                </Button>
              </div>

              <div className='space-y-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='edit-title'>Tiêu đề bài viết</Label>
                    <Input
                      id='edit-title'
                      placeholder='Nhập tiêu đề bài viết'
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <Label htmlFor='edit-category'>Danh mục</Label>
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        className='text-primary-500 hover:text-primary-600 hover:bg-primary-50'
                        onClick={() => setShowCategoryModal(true)}
                      >
                        <PlusCircle className='h-4 w-4 mr-1' />
                        Thêm danh mục
                      </Button>
                    </div>
                    <select
                      id='edit-category'
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
                    <Label htmlFor='edit-image'>URL ảnh minh họa</Label>
                    <Input
                      id='edit-image'
                      placeholder='https://example.com/image.jpg'
                      value={formData.image}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='edit-excerpt'>Mô tả ngắn</Label>
                    <Textarea
                      id='edit-excerpt'
                      placeholder='Mô tả ngắn về nội dung bài viết'
                      value={formData.excerpt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='edit-content'>Nội dung</Label>
                    <Textarea
                      id='edit-content'
                      className='min-h-[300px]'
                      placeholder='Nội dung chi tiết của bài viết'
                      value={formData.content}
                      onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                </div>

                <div className='flex justify-end space-x-4 pt-4'>
                  <Button
                    variant='outline'
                    onClick={() => handleUpdatePost(true)}
                    disabled={isLoading}
                    className='hover:bg-gray-50 transition-colors duration-300'
                  >
                    {isLoading ? 'Đang xử lý...' : 'Lưu nháp'}
                  </Button>
                  <Button
                    className='bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg'
                    onClick={() => handleUpdatePost(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Cập nhật & Xuất bản'}
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={closeEditModal}
                    disabled={isLoading}
                    className='hover:bg-red-50 hover:text-red-600 transition-colors duration-300'
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md animate-fade-in'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>Tạo danh mục mới</CardTitle>
                <Button variant='ghost' size='sm' onClick={closeCategoryModal}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
              <CardDescription>Thêm danh mục mới cho blog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='new-category-name'>Tên danh mục</Label>
                  <Input
                    id='new-category-name'
                    placeholder='Nhập tên danh mục'
                    value={newCategory.name}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='new-category-desc'>Mô tả (tùy chọn)</Label>
                  <Textarea
                    id='new-category-desc'
                    placeholder='Mô tả ngắn về danh mục'
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button variant='outline' onClick={closeCategoryModal} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateCategory} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                        Đang xử lý
                      </>
                    ) : (
                      'Tạo danh mục'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md animate-fade-in'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle>Chỉnh sửa danh mục</CardTitle>
                <Button variant='ghost' size='sm' onClick={closeEditCategoryModal}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
              <CardDescription>Cập nhật thông tin danh mục blog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-category-name'>Tên danh mục</Label>
                  <Input
                    id='edit-category-name'
                    placeholder='Nhập tên danh mục'
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit-category-desc'>Mô tả (tùy chọn)</Label>
                  <Textarea
                    id='edit-category-desc'
                    placeholder='Mô tả ngắn về danh mục'
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button variant='outline' onClick={closeEditCategoryModal} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateCategory} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                        Đang xử lý
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Category Confirmation */}
      {showDeleteCategoryConfirm && categoryToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md animate-fade-in'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle className='text-red-600'>Xác nhận xóa</CardTitle>
                <Button variant='ghost' size='sm' onClick={closeDeleteCategoryConfirm}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p>
                  Bạn có chắc chắn muốn xóa danh mục <strong>{categoryToDelete.name}</strong>?
                </p>
                <p className='text-sm text-gray-500'>
                  Thao tác này không thể hoàn tác và có thể ảnh hưởng đến các bài viết thuộc danh mục này.
                </p>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button variant='outline' onClick={closeDeleteCategoryConfirm} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button variant='destructive' onClick={handleDeleteCategory} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                        Đang xử lý
                      </>
                    ) : (
                      'Xóa danh mục'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BlogManagement
