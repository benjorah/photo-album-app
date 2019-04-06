import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import OptionSelect from '<molecules>/OptionSelect/OptionSelect'
import PageTemplate from '<templates>/PageTemplate'
import Pagination from '<molecules>/Pagination/Pagination'
import { UsersContext } from '<state>/GlobalContext'
import useDataFromApi from '<state>/hooks/useDataFromApi'
import usePagination from '<state>/hooks/usePagination'
import { getUsers } from '<helpers>/utils'

function withPageTemplate (Component, path, pageTitle, fn = () => { }) {
  function CurrentPage (props) {
    const albumId = props.match.params.albumId || ''
    const allUsers = useContext(UsersContext)
    const users = getUsers(allUsers)

    const startPostion = 0
    const initLimit = 10
    const filterValue = albumId || ''
    const urlParams = new URLSearchParams(window.location.search)
    const currentPage = Number(urlParams.get('page')) || 1

    const {
      start,
      setStart,
      limit,
      setLimit
    } = usePagination(startPostion, initLimit)

    const { data } = useDataFromApi(
      path, {
        _start: start,
        _limit: limit,
        albumId: filterValue
      }
    )

    let photoResults, albumResults
    if (albumId) {
      photoResults = fn(data, albumId)
    } else {
      albumResults = fn(data, users)
    }

    return (
      <PageTemplate pageTitle={pageTitle}>
        <Component {...albumResults} photoResults={photoResults} history={props.history} />
        <OptionSelect
          handleOnChange={handleOnChangeLimit} initLimit={initLimit} />
        <Pagination
          limit={limit}
          onPageChange={handleOnPageChange}
          page={currentPage}
          startPosition={start}
        />
      </PageTemplate>)

    function handleOnPageChange (page, startPosition) {
      setStart(startPosition)
      pushStatePage(page)
    }

    function pushStatePage (page) {
      props.history.push(`/?page=${page}`)
    }

    function handleOnChangeLimit (e) {
      setLimit(Number(e.target.value))
      setStart(0)
      pushStatePage(1)
    }
  }

  CurrentPage.propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
  }

  return CurrentPage
}

export default withPageTemplate