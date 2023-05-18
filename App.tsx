import React, {useState, useEffect, useCallback, useMemo} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  View,
  Alert,
  Pressable,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import type {ListRenderItem} from 'react-native';

export interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

function App(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProductKey, setSearchProductKey] = useState<string>('');
  const [openModalFor, setOpenModalFor] = useState<number | null>(null);

  const renderProductItem: ListRenderItem<Product> = useCallback(data => {
    const {
      item: {id, title, price, stock},
      index,
    } = data;
    return (
      <View
        style={{
          backgroundColor: '#eee',
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#aaa',
          padding: 10,
          margin: 8,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}>
          <View>
            <Text># {id}</Text>
            <View style={{flexDirection: 'row', gap: 12}}>
              <Text>{title}</Text>
              <Text>Available: {stock}</Text>
            </View>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>${price}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => setOpenModalFor(index)}
          style={{alignSelf: 'flex-end'}}>
          <Text style={{color: 'blue'}}>Show Images</Text>
        </Pressable>
      </View>
    );
  }, []);

  const renderHeaderComponent = useCallback(() => {
    return (
      <View style={{backgroundColor: '#bbb'}}>
        <TextInput
          onChangeText={setSearchProductKey}
          placeholder="Search Title, Brand, Category"
          value={searchProductKey}
          style={{backgroundColor: '#FFF', padding: 12, margin: 8}}
        />
      </View>
    );
  }, [searchProductKey]);

  const renderImages = useCallback((data: Product) => {
    return data.images.map((uri, index) => (
      <View key={`image#${index}`} style={{backgroundColor: '#bbb'}}>
        <Image source={{uri}} />
      </View>
    ));
  }, []);

  useEffect(() => {
    axios
      .get<ProductResponse>('https://dummyjson.com/products')
      .then(response => {
        const {data, status} = response;
        if (status === 200) {
          setProducts(data.products);
        } else {
          Alert.alert('Request Failed', 'Could not fetch products details');
        }
      })
      .catch(error => {
        Alert.alert('Request Failed', 'Could not fetch products details');
      })
      .finally(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    const searchProductKeyLower = searchProductKey.toLowerCase();

    return products.filter(({title, brand, category}) => {
      return (
        title.toLowerCase().includes(searchProductKeyLower) ||
        brand.toLowerCase().includes(searchProductKeyLower) ||
        category.toLowerCase().includes(searchProductKeyLower)
      );
    });
  }, [searchProductKey, products]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {renderHeaderComponent()}
      <FlatList<Product>
        data={filteredProducts}
        renderItem={renderProductItem}
      />
      <Modal visible={openModalFor != null}>
        <View style={{flex: 1}}>
          <ScrollView>
            {openModalFor === null ? (
              <Text>Cannot load images</Text>
            ) : (
              products[openModalFor].images.map((uri, index) => (
                <View key={`image#${index}`} style={{backgroundColor: '#bbb'}}>
                  <Image source={{uri}} style={{aspectRatio: 1 / 1}} />
                </View>
              ))
            )}
          </ScrollView>
          <View
            style={{
              height: 60,
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}>
            <Pressable onPress={() => setOpenModalFor(null)}>
              <View
                style={{
                  backgroundColor: '#FFF',
                  alignSelf: 'flex-end',
                  borderColor: '#ddd',
                  borderWidth: 2,
                  borderRadius: 2,
                  width: '50%',
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>Close</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
