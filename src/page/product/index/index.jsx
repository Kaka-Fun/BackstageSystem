/*
 * @Author: wyatt 
 * @Date: 2018-07-10 23:26:23 
 * @Last Modified by: wyatt
 * @Last Modified time: 2018-07-12 13:57:45
 */


import React from 'react';
import PageTitle from 'component/page-title/index.jsx';
import { Link } from 'react-router-dom'
import './index.scss'
import Pagination from 'util/pagination/index.jsx'
import ListSearch from './index-list-search.jsx'
import TableList from 'util/table-list/index.jsx'
import Product from 'service/product-service.jsx'
import MUtil from 'util/mm.jsx'
const _mm = new MUtil();
const _product = new Product();


export default class ProductList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            pageNum: 1,
            list: [],
            listType: 'list'
        }
    }
    componentDidMount(){
        this.loadProductList()
    }
    loadProductList(){
        let listParam = {}
        listParam.listType = this.state.listType
        listParam.pageNum = this.state.pageNum
        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        if (this.state.listType === 'search') {
            listParam.searchType = this.state.searchType
            listParam.keyword = this.state.searchKeyword
        }
        // 搜索
        _product.getProductList(listParam).then((res)=>{
            this.setState(res)
        }, (errMsg)=>{
            this.setState({
                list: []
            })
            _mm.errorTips(errMsg)
        })
    }
    // 搜索
    onSearch(searchType, searchKeyword){
        let listType = searchKeyword === '' ? 'list' : 'search'
        this.setState({
            listType: listType,
            pageNum: 1,
            searchType: searchType,
            searchKeyword: searchKeyword
        }, ()=>{
            this.loadProductList()
        })
    }
    // 页数发生变化的时候
    onPageNumChange(pageNum){
        this.setState({
            pageNum: pageNum
        }, ()=>{
            this.loadProductList()
        })
    }
    // 改变商品状态, 上架或者下架
    onSetProductStatus(e, productId, currentStatus){
        let newStatus = currentStatus === 1 ? 2 : 1,
            confirmTips = currentStatus === 1 ? '确认下架该商品？' : '确认上架该商品？'
            if(window.confirm(confirmTips)){
                _product.setProductStatus({
                    productId: productId,
                    status: newStatus
                }).then((res)=>{
                    _mm.successTips(res)
                    this.loadProductList()
                }, (errMsg)=>{
                    _mm.errorTips(errMsg)
                })
            }
    }
    render(){
        let tableHeads = [
            {name: '商品ID', width: '10%'},
            {name: '商品信息', width: '50%'},
            {name: '价格', width: '10%'},
            {name: '状态', width: '15%'},
            {name: '操作', width: '15%'},
        ]
        return(
            <div id="page-wrapper">
                <PageTitle title="商品列表">
                    <div className="page-header-right">
                        <Link to="/product/save" className="btn btn-primary">
                            <i className="fa fa-plus"></i>
                            <span>添加商品</span>
                        </Link>
                    </div>
                </PageTitle>
                <ListSearch onSearch={(searchType, searchKeyword)=>this.onSearch(searchType, searchKeyword)}/>
                <TableList tableHeads={tableHeads}>
                {
                    this.state.list.map((product, index) => {
                        return(
                            <tr key={index}>
                                <td>{product.id}</td>
                                <td>
                                    <p>{product.name}</p>
                                    <p>{product.subtitle}</p>
                                </td>
                                <td>￥{product.price}</td>
                                <td>
                                    <p>{product.status === 1 ? '在售' : '已下架'}</p>
                                    <button className="btn btn-xs btn-warning" onClick={(e)=>{this.onSetProductStatus(e, product.id, product.status)}}>{product.status === 1 ? '下架' : '上架'}</button>
                                </td>
                                <td>
                                    <Link className="opear" to={`/product/detail/${product.id}`}>详情</Link>
                                    <Link className="opear" to={`/product/save/${product.id}`}>编辑</Link>
                                </td>
                            </tr>
                        )
                    })
                }
                </TableList>
                <Pagination 
                    current={this.state.pageNum} 
                    total={this.state.total}  
                    onChange={(pageNum)=>this.onPageNumChange(pageNum)}
                    />
            </div>
        )
    }
}