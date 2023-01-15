import React, { useState } from 'react'
import { Button, Flex,  Heading,  LinkBox, LinkOverlay, Text, useBreakpointValue } from '@chakra-ui/react'
import Course from '../../components/Course'
import { useUser } from '../../auth/UserContext'

import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Pagination } from 'swiper'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'
import 'swiper/css'

import './styles.css'
import { useEffect } from 'react'
import useSWR from 'swr'

const Courses = () => {
    const [events, setEvents] = useState([])
    const { data, isLoading } = useSWR(`
        *[_type == 'event' && event_type in ['course', 'internship']][0..3] 
        { 
            event_type, 
            title, 
            description, 
            slug,
            date,
            event_type == 'course' => {
                'children': *[_type =='event' && references(^._id)],
                'instructors': *[_type == 'event' && references(^._id)]{instructors[]->{name, image, _id}}.instructors[]
            },
            event_type == 'internship' => {
                'children': *[_type =='event' && references(^._id)],
                'instructors': *[_type == 'event' && references(^._id)] {
                    'children': *[_type == 'event' && references(^._id)]{ instructors[]->{name, image, _id}}
                }.children[].instructors[]
            }
        }
    `) 

    useEffect(() => {
        setEvents(data?.map(event => {
            if (['course', 'internship'].includes(event?.event_type)) {
                return {
                    ...event,
                    instructors: [...new Map(event.instructors.map(item => 
                        [item['_id'], item])).values()]
                }
            } else return event
        }))
    }, [data])

    const nullSlides = [...Array(4)].map((_, key) => (
        <SwiperSlide style={{ display: "flex", justifyContent: "center" }} key={key}>
            <Course loading={true} />
        </SwiperSlide>
    ))

    return (
        
        <Flex flexDir="column" align="center" my="3em" w={{
            base: '90vw',
            lg: '1114px',
            xl: '1400px',
            '2xl': '1400px',
        }}>
            <Heading fontSize="28px" fontWeight="medium" mb="0.5">Browse Our Courses</Heading>
            <Text mb="1em" textAlign="center">Grow your skills by studying from our exciting courses</Text>
            <LinkBox>
                <LinkOverlay  href="/courses" w="fit-content">
                    <Button mb="2em">View All Courses</Button>
                </LinkOverlay>
            </LinkBox>
            <Flex w="100%" align="center">
            {/* <BsChevronLeft cursor="pointer" onClick={() => swipe?.slidePrev()} /> */}
            <Swiper
                modules={[Pagination, EffectFade]}
                effect
                speed={300}
                style={{
                    width: '100%',
                    paddingBottom: "5em",
                    // minHeight: "480px",
                }}
                slidesPerView={useBreakpointValue({ base: 1, md:2, lg: 3, xl: 4})}
                slidesPerGroup={useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4})}
                spaceBetween={20}
                pagination={{
                    clickable: true,
                }}
            >
            {isLoading ? nullSlides : events?.slice(0, 10).map((event, idx) => (
                <SwiperSlide style={{ display: "flex", justifyContent: "center" }}>
                    <LinkBox>
                    <LinkOverlay href={`/${["course_lecture", "webinar"].includes(event.event_type) ? 'lecture' : 'course'}/${event.id}`}>
                        <Course course={event} key={idx} />
                    </LinkOverlay>
                    </LinkBox>
                </SwiperSlide>
            ))}
            </Swiper>
            {/* <BsChevronRight cursor="pointer" onClick={() => swipe?.slideNext()} /> */}
            </Flex>
            
        </Flex>
    )
}

export default Courses