'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { userApi } from '@/lib/user-api'
import { useUserStore } from '@/stores/user.store'
import { Review, ReviewsResponse } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated, user } = useUserStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const { data } = await api.get<ReviewsResponse>(`/reviews/product/${productId}`)
      setReviews(data.reviews)
      setStats(data.stats)

      if (isAuthenticated() && user) {
        const existingReview = data.reviews.find((r) => r.userId === user.id)
        setUserReview(existingReview || null)
      }
    } catch {
      console.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to leave a review',
      })
      return
    }

    if (comment.length < 10) {
      toast({
        title: 'Review too short',
        description: 'Please write at least 10 characters',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (userReview) {
        await userApi.put(`/reviews/${userReview.id}`, { rating, comment })
        toast({ title: 'Review updated!' })
      } else {
        await userApi.post(`/reviews/product/${productId}`, { rating, comment })
        toast({ title: 'Review submitted!' })
      }
      setShowForm(false)
      setComment('')
      fetchReviews()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!userReview) return

    try {
      await userApi.delete(`/reviews/${userReview.id}`)
      toast({ title: 'Review deleted' })
      setUserReview(null)
      fetchReviews()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      })
    }
  }

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } ${onChange ? 'cursor-pointer' : ''}`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  )

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Customer Reviews</CardTitle>
          {isAuthenticated() && !userReview && (
            <Button onClick={() => setShowForm(!showForm)}>
              Write a Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <div>
            <StarRating value={Math.round(stats.averageRating)} />
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div>
                <Label htmlFor="comment">Your Review</Label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* User's existing review */}
        {userReview && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">Your Review</p>
                <StarRating value={userReview.rating} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRating(userReview.rating)
                    setComment(userReview.comment)
                    setShowForm(true)
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground">{userReview.comment}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(userReview.createdAt)}
            </p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((r) => r.userId !== user?.id)
              .map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <StarRating value={review.rating} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
