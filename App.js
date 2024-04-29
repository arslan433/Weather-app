import { View, Text, StatusBar, Image, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { theme } from './thems/theme'
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from './api/weather'
import * as Progress from 'react-native-progress'
import { getData, storeData } from './api/AsyncStorage'
export default function App() {
  let [showSearch, ToogleSearch] = useState(false)
  let [locations, setLocations] = useState([])
  let [weather, setWeather] = useState({})
  let [loading, setloading] = useState(true)

  const handlelocation = (loc) => {
    // console.log('location', loc)
    setLocations([])
    ToogleSearch(false)
    setloading(true)
    fetchLocations({
      cityName: loc.name,
      day: '7'
    }).then(data => {
      setWeather(data)
      setloading(false)
      storeData('city ', loc.name)
      // console.log(' got Forecast', data)
    })
  }

  const handleSearch = (value) => {
    //fetch location 
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then(data => {
        setLocations(data)
      })
    }
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])



  useEffect(() => {
    fetchMyWeatherData()
  }, [])

  const fetchMyWeatherData = async () => {
    let mycity = await getData('city')
    let cityName = 'Murree'
    if(mycity) cityName = mycity
    fetchWeatherForecast({
      cityName,
      day: '7'
    }).then(data => {
      setWeather(data)
      setloading(false)
    })
  }

  const { current, location } = weather
  return (
    <View className="flex-1 relative ">
      <StatusBar barStyle={'light-content'} />
      <Image blurRadius={80} source={require('./images/bg.jpg')}
        className='absolute h-full w-full'
      />
      {
        loading ? (
          <View className='flex-1 flex-row justify-center items-center'>
            <Progress.CircleSnail thickness={7} size={100} color={"#0bb3b2"}/>
          </View>
        ): (
            <SafeAreaView className = 'flex flex-1' >
        {/* search section */ }
        <View style={{ height: '7%' }} className='mx-4 relative z-50'>
        <View className='flex-row justify-end items-center rounded-full'
          style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}
        >
          {
            showSearch ?
              <TextInput
                onChangeText={handleTextDebounce}
                placeholder='Search city' placeholderTextColor={'lightgray'}
                className='pl-6 h-10 pb-1 flex-1 text-base text-white'
              /> : null

          }
          <TouchableOpacity onPress={() => ToogleSearch(!showSearch)} className='rounded-full p-3 m-1'
            style={{ backgroundColor: theme.bgWhite(0.3) }}>
            <MagnifyingGlassIcon size='25' color='white' />
          </TouchableOpacity>
        </View>
        {
          locations.length > 0 && showSearch ? (
            <View className='absolute w-full bg-gray-300 top-16 rounded-3xl '>
              {
                locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : ' '
                  return (
                    <TouchableOpacity
                      onPress={() => handlelocation(loc)}
                      key={index}
                      className={'flex-row items-center border-0 p-3 px-4 mb-1 ' + borderClass}
                    >
                      <MapPinIcon size='20' color="grey" />
                      <Text className='text-black text-lg ml-2'>{loc?.name} , {loc?.country}</Text>
                    </TouchableOpacity>
                  )
                })
              }
            </View>
          ) : null
        }
      </View>

      {/* forecast section */}
      <View className='mx-4 flex justify-around flex-1 mb-2 '>
        {/* location */}

        <Text className='text-center text-white text-2xl font-bold'>{location?.name} ,
          <Text className='text-lg font-semibold text-gray-300'>{" " + location?.country}</Text>
        </Text>
        {/* weather image */}
        <View className='flex-row justify-center '>
          <Image source={{ uri: 'https:' + current?.condition?.icon }}
            className='w-52 h-52'
          />
        </View>
        {/* degree celcius */}
        <View>
          <Text className='text-center font-bold text-white text-6xl ml-5 '>
            {current?.temp_c}&#176;
          </Text>
          <Text className='text-center  text-white text-xl tracking-widest'>
            {current?.condition?.text}
          </Text>
        </View>
        {/* other stats */}
        <View className='flex-row justify-between mx-4'>
          <View className='flex-row space-x-2 items-center'>
            <Image source={require('./images/wind.png')}
              className='h-6 w-6'
            />
            <Text className='text-white font-semibold text-base'>{current?.wind_kph}km/h</Text>
          </View>
          <View className='flex-row space-x-2 items-center'>
            <Image source={require('./images/drop.png')}
              className='h-6 w-6'
            />
            <Text className='text-white font-semibold text-base'>{current?.humidity}%</Text>
          </View>
          <View className='flex-row space-x-2 items-center'>
            <Image source={require('./images/sun.png')}
              className='h-6 w-6'
            />
            <Text className='text-white font-semibold text-base'>{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
          </View>
        </View>
      </View>

      {/* forecast for next days */}
      <View className='mb-2 space-y-3'>
        <View className='flex-row space-x-2 items-center mx-5'>
          <CalendarDaysIcon color='white' size='22' />
          <Text className='text-white text-base'>Daily Forecast</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        >
          {
            weather?.forecast?.forecastday?.map((item, index) => {
              let date = new Date(item.date)
              let options = { weekend: 'long' }
              let dayName = date.toLocaleDateString('en-US', options)
              dayName = dayName.split(',')[0]
              return (
                <View key={index} className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4'
                  style={{ backgroundColor: theme.bgWhite(0.15) }}
                >
                  <Image source={{ uri: 'https:' + item?.day?.condition?.icon }}
                    className='h-11 w-11' />
                  <Text className='text-white'>{dayName}</Text>
                  <Text className='text-white text-lg font-semibold'>{item?.day?.avgtemp_c}&#176;</Text>
                </View>
              )
            })
          }
        </ScrollView>
      </View>
    </SafeAreaView>

  )
}
    </View >
  )
}
