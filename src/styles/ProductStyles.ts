import styled from 'styled-components';
import Image from 'next/image';

export const ProductsHeader = styled.h1`
  text-align: left;
  margin-top: 20px;
  font-size: 2rem;
`;

export const ProductsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
`;

export const ProductCard = styled.div`
  width: 300px;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

export const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProductImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ProductContent = styled.div`
  padding: 16px;
`;

export const ProductTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 1.25rem;
  color: #333;
`;

export const ProductDescription = styled.p`
  margin: 0;
  font-size: 1rem;
  color: #666;
`;
