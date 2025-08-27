import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Truck, 
  Shield, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  Package,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import AIRecommendations from '../../components/marketplace/AIRecommendations';
import ProductQA from '../../components/marketplace/ProductQA';
import ProductActionButtons from '../../components/marketplace/ProductActionButtons';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  subcategory: string;
  brand: string;
  inStock: boolean;
  fastDelivery: boolean;
  isPrime: boolean;
  isDeal: boolean;
  dealEndsIn?: string;
  description: string;
  features: string[];
  images: string[];
  specifications: Record<string, string>;
  reviews: Review[];
  relatedProducts: string[];
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockProduct: Product = {
        id: 1,
        name: 'Apple iPhone 15 Pro Max - 256GB - Natural Titanium',
        price: 1199.99,
        originalPrice: 1299.99,
        rating: 4.8,
        reviewCount: 1247,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        category: 'electronics',
        subcategory: 'Smartphones',
        brand: 'Apple',
        inStock: true,
        fastDelivery: true,
        isPrime: true,
        isDeal: true,
        dealEndsIn: '2 days',
        description: 'The most advanced iPhone ever with A17 Pro chip, 48MP camera, and titanium design. Experience unprecedented performance and photography capabilities with the latest iPhone 15 Pro Max.',
        features: [
          'A17 Pro chip with 6-core GPU',
          '48MP Main camera with 2x Telephoto',
          'Titanium design with Ceramic Shield',
          'USB-C connector for faster charging',
          'Action button for quick access',
          'Always-On display with ProMotion',
          'Emergency SOS via satellite',
          'Face ID for secure authentication'
        ],
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop'
        ],
        specifications: {
          'Display': '6.7-inch Super Retina XDR display',
          'Chip': 'A17 Pro chip with 6-core GPU',
          'Storage': '256GB',
          'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
          'Video': '4K ProRes video recording',
          'Battery': 'Up to 29 hours video playback',
          'Charging': 'USB-C connector',
          'Water Resistance': 'IP68',
          'Operating System': 'iOS 17',
          'Dimensions': '159.9 x 76.7 x 8.25 mm',
          'Weight': '221 grams'
        },
        reviews: [
          {
            id: '1',
            user: {
              name: 'Sarah Johnson',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              verified: true
            },
            rating: 5,
            title: 'Absolutely amazing phone!',
            content: 'This is by far the best iPhone I\'ve ever owned. The camera quality is incredible, the performance is lightning fast, and the titanium design feels premium. The battery life is also impressive.',
            date: '2024-01-15',
            helpful: 24,
            images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop']
          },
          {
            id: '2',
            user: {
              name: 'Mike Chen',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              verified: true
            },
            rating: 4,
            title: 'Great phone with minor issues',
            content: 'Overall excellent phone. The camera is fantastic and the performance is top-notch. However, the battery life could be better for heavy usage.',
            date: '2024-01-10',
            helpful: 12
          },
          {
            id: '3',
            user: {
              name: 'Emily Davis',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              verified: false
            },
            rating: 5,
            title: 'Worth every penny!',
            content: 'I was hesitant about the price, but this phone is absolutely worth it. The camera quality alone makes it worth the investment.',
            date: '2024-01-08',
            helpful: 8
          }
        ],
        relatedProducts: [2, 5, 8]
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);
  }, [id]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/marketplace" className="text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} className="inline mr-1" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} className="mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              {product.isDeal && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {discountPercentage}% OFF
                </div>
              )}
              {product.isPrime && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Prime
                </div>
              )}
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                <Heart size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Image Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                disabled={selectedImage === 0}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                disabled={selectedImage === product.images.length - 1}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-600">
              <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
              <span className="mx-2">›</span>
              <Link to={`/marketplace?category=${product.category}`} className="hover:text-blue-600 capitalize">
                {product.category}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{product.name}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{product.rating}</span>
              </div>
              <Link to="#reviews" className="text-blue-600 hover:text-blue-700 text-sm">
                {product.reviewCount} reviews
              </Link>
              <button className="text-gray-600 hover:text-gray-900">
                <Share2 size={16} />
              </button>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-green-600 font-medium">Save ${(product.originalPrice! - product.price).toFixed(2)}</span>
                )}
              </div>
              {product.dealEndsIn && (
                <div className="flex items-center text-sm text-red-600">
                  <Clock size={16} className="mr-1" />
                  Deal ends in {product.dealEndsIn}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-1">
                {product.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>



            {/* Action Buttons */}
            <ProductActionButtons
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                brand: product.brand,
                inStock: product.inStock
              }}
              quantity={1}
              showQuantitySelector={true}
            />

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Truck size={16} className="mr-2" />
                <span>Free delivery by {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              {product.fastDelivery && (
                <div className="flex items-center text-sm text-green-600">
                  <Package size={16} className="mr-2" />
                  <span>Fast delivery available</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Shield size={16} className="mr-2" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center text-sm">
              <span className={`w-2 h-2 rounded-full mr-2 ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${product.reviewCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Key Features:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Write a Review
                  </button>
                </div>

                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{product.rating}</div>
                      <div className="flex items-center justify-center my-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Based on {product.reviewCount} reviews</div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 w-8">{stars} stars</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${(product.reviews.filter(r => r.rating === stars).length / product.reviewCount) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {product.reviews.filter(r => r.rating === stars).length}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{review.user.name}</span>
                            {review.user.verified && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex space-x-2 mb-3">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <button className="flex items-center space-x-1 hover:text-blue-600">
                              <ThumbsUp size={16} />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-600">
                              <MessageCircle size={16} />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

                  {/* Q&A Section */}
          <div className="mt-8">
            <ProductQA 
              productId={id || ''}
              productName={product?.name || ''}
            />
          </div>

          {/* AI Recommendations */}
          <div className="mt-8 space-y-8">
            {/* Customers Also Bought */}
            <AIRecommendations 
              type="customers-also-bought"
              productId={id}
              limit={6}
              title="Customers Also Bought"
              showReason={true}
            />

            {/* Similar Products */}
            <AIRecommendations 
              type="similar-products"
              productId={id}
              category={product?.category}
              limit={6}
              title="Similar Products You Might Like"
              showConfidence={true}
            />

            {/* Trending in Category */}
            <AIRecommendations 
              type="trending"
              category={product?.category}
              limit={4}
              title="Trending in Electronics"
            />
          </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-3 h-3 rounded-full ${
                    selectedImage === index ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
