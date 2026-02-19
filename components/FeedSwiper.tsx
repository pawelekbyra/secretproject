"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Mousewheel, Keyboard, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/mousewheel';
import 'swiper/css/virtual';
import Slide from '@/components/Slide';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/useStore';
import { SlidesResponseSchema } from '@/lib/validators';
import { SlideDTO } from '@/lib/dto';
import { fetchComments, fetchAuthorProfile } from '@/lib/queries';

const fetchSlides = async ({ pageParam = '' }) => {
  const res = await fetch(`/api/slides?cursor=${pageParam}&limit=5`);
  if (!res.ok) {
    throw new Error('Failed to fetch slides');
  }
  const data = await res.json();

  try {
      const parsed = SlidesResponseSchema.parse(data);
      return parsed;
  } catch (e) {
      console.error("Slides API validation error:", e);
      throw new Error("Invalid data received from Slides API");
  }
};

const FeedSwiper = () => {
  // Use atomic selectors to minimize re-renders as requested
  const setActiveSlide = useStore(state => state.setActiveSlide);
  const setNextSlide = useStore(state => state.setNextSlide);
  const playVideo = useStore(state => state.playVideo);
  const activeSlideId = useStore(state => state.activeSlide?.id);

  const queryClient = useQueryClient();
  const swiperInstance = useRef<SwiperType | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['slides'],
    queryFn: fetchSlides,
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    return (data?.pages.flatMap(page => page.slides) ?? []) as SlideDTO[];
  }, [data]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newActiveIndex = swiper.realIndex;
    setActiveIndex(newActiveIndex);

    if (newActiveIndex >= 0 && newActiveIndex < slides.length) {
      const currentSlide = slides[newActiveIndex];
      const nextSlide = slides[newActiveIndex + 1] || null;

      if (activeSlideId !== currentSlide.id) {
        setActiveSlide(currentSlide);
        setNextSlide(nextSlide);

        // Pre-fetch comments and author profile
        if (currentSlide.id) {
          queryClient.prefetchInfiniteQuery({
            queryKey: ['comments', currentSlide.id],
            queryFn: ({ pageParam }) => fetchComments({ pageParam, slideId: currentSlide.id }),
            initialPageParam: '',
            staleTime: 1000 * 60 * 5,
          });
        }
        if (currentSlide.userId) {
          queryClient.prefetchQuery({
            queryKey: ['author', currentSlide.userId],
            queryFn: () => fetchAuthorProfile(currentSlide.userId),
            staleTime: 1000 * 60 * 5,
          });
        }

        if (currentSlide.type === 'video') {
          playVideo();
        }
      }
    }

    // Infinite scroll trigger
    if (newActiveIndex >= slides.length - 2 && hasNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading && slides.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        Error loading slides.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <Swiper
        modules={[Mousewheel, Keyboard, Virtual]}
        direction="vertical"
        loop={true}
        mousewheel={true}
        keyboard={{ enabled: true }}
        onSwiper={(swiper) => {
          swiperInstance.current = swiper;
        }}
        onSlideChange={handleSlideChange}
        className="h-full w-full"
        virtual
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} virtualIndex={index}>
            {({ isActive }) => {
              // We consider priorityLoad for current and next slide
              const isNext = index === (activeIndex + 1) % slides.length;
              const priorityLoad = isActive || isNext;
              return <Slide slide={slide} priorityLoad={priorityLoad} />;
            }}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeedSwiper;
