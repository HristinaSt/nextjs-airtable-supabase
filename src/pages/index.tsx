import { useEffect, useState } from 'react';
import supabase from '../lib/supabaseClient';
import { Card, Input,  Image as NextImage } from '@nextui-org/react';
import { Product } from '../types/product';
import { Footer } from '../styles/FooterStyles';
import { PaginationWrapper, PaginationButton } from '../styles/PaginationStyles';
import { ModalWrapper, ModalContent, ModalImageWrapper, CloseButton, ArrowButton } from '../styles/ModalStyles';
import {  ProductImage,  ProductTitle, ProductDescription } from '../styles/ProductStyles';


const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex === products.length - 1 ? 0 : prevIndex + 1));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [products.length]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredProducts(filtered);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setItemsPerPage(Number(e.target.value));
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };
  const handlePrev = () => {
    if (selectedProduct) {
      const currentIndex = products.findIndex((p) => p.id === selectedProduct.id);
      const prevIndex = (currentIndex - 1 + products.length) % products.length;
      setSelectedProduct(products[prevIndex]);
    }
  };
  const handleNext = () => {
    if (selectedProduct) {
      const currentIndex = products.findIndex((p) => p.id === selectedProduct.id);
      const nextIndex = (currentIndex + 1) % products.length;
      setSelectedProduct(products[nextIndex]);
    }
  };

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <div style={{ padding: '20px' }}>
        <h1>Products</h1>
        <Card  isBlurred shadow="sm" className="border-none">
          <NextImage
            src={products[currentImageIndex]?.image || '/default-banner.jpg'}
            style={{ objectFit: 'cover' }}
            width={'100%'}
            height={300}
            alt={products[currentImageIndex]?.title}
          />
        </Card>
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ width: '300px', margin: '20px auto', display: 'block' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <Card style={{ width: '300px' }} key={product.id} isHoverable isPressable onClick={() => handleOpenModal(product)}>
                <NextImage
                  src={product.image || '/default-image.png'}
                  width="100%"
                  height={200}
                  alt={product.title}
                />
                <div style={{ padding: '16px' }}>
                  <h4>{product.title}</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {product.short_description?.length > 100
                      ? `${product.short_description.substring(0, 100)}...`
                      : product.short_description}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>
        <PaginationWrapper>
          <PaginationButton onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            Previous
          </PaginationButton>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
          </select>
          <PaginationButton
            onClick={() => handlePageChange(page + 1)}
            disabled={page * itemsPerPage >= filteredProducts.length}
          >
            Next
          </PaginationButton>
        </PaginationWrapper>
      </div>

      {selectedProduct && (
        <ModalWrapper onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImageWrapper>
              <ProductImage
                src={selectedProduct.image || '/default-image.png'}
                alt={selectedProduct.title}
                layout="fill"
                objectFit="cover"
              />
            </ModalImageWrapper>
            <ProductTitle>{selectedProduct.title}</ProductTitle>
            <ProductDescription>{selectedProduct.short_description}</ProductDescription>
            <ArrowButton onClick={handlePrev} style={{ left: '5px' }}>
              &#9664;
            </ArrowButton>
            <ArrowButton onClick={handleNext} style={{ right: '5px' }}>
              &#9654;
            </ArrowButton>
            <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          </ModalContent>
        </ModalWrapper>
      )}
      <Footer>&copy; {new Date().getFullYear()} My Products App. All rights reserved.</Footer>
    </>
  );
};

export default Home;
