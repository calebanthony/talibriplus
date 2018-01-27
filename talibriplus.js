// ==UserScript==
// @name         Talibri+
// @version      0.1.1
// @description  Bonus functionality for Talibri
// @author       
// @grant        none
// @match        http*://talibri.com/*
// @namespace    https://talibri.com/
// ==/UserScript==

/* global $ localStorage window MutationObserver document Audio selectOrderType selectOrderFilter */

$(document).on('turbolinks:load', () => {
  /**
   * Initial setup with variables and the settings
   */
  const getUsername = () => $.trim($('i.fa-user-circle').parent().text())
  const chatPing = new Audio('https://soundbible.com/grab.php?id=1424&type=mp3')

  let game = {
    user: getUsername(),
    lastAction: undefined,
    pref: {
      chatpings: true,
      sounds: true,
    },
  }

  /**
   * Chat features
   */
  const chatAlert = (message) => {
    $(message).css('padding', '2px')
    $(message).css('background-color', 'rgba(51, 122, 183, 0.3)')

    if (game.pref.sounds === true) {
      chatPing.play()
    }
  }

  const reactToChatPings = (changes) => {
    changes.forEach((change) => {
      const newMessage = change.target.children[change.target.children.length - 1]
      if ($(newMessage).text().toLowerCase().indexOf(`@${$.trim(game.user.toLowerCase())}`) !== -1) {
        chatAlert(newMessage)
      }
    })
  }

  const listenForChatPings = () => {
    const messageBox = $('#messages')[0]
    const config = { childList: true }

    const observer = new MutationObserver(reactToChatPings)
    observer.observe(messageBox, config)
  }

  /**
   * Settings window to let the user change features
   */
  $($('#bs-example-navbar-collapse-1 ul.navbar-nav.navbar-right li.dropdown ul.dropdown-menu').splice(-1)[0])
    .append('<li class="text-center"><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#talibriPlusModal" id="talibriPlusSettings">Talibri+ Settings</button></li>')

  let modal = ''
  modal += '<div class="modal fade" tabindex="-1" role="dialog" id="talibriPlusModal">'
  modal += '<div class="modal-dialog" role="document">'
  modal += '<div class="modal-content">'
  modal += '<div class="modal-header">'
  modal += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
  modal += '<h4 class="modal-title">Talibri+ Settings</h4>'
  modal += '</div>'
  modal += '<div class="modal-body">'
  modal += '<form>'
  modal += '<div class="checkbox">'
  modal += '<label><input id="chatpings" type="checkbox">Chat Pings</label>'
  modal += '</div>'
  modal += '<div class="checkbox">'
  modal += '<label><input id="sounds" type="checkbox">Sounds</label>'
  modal += '</div>'
  modal += '</form>'
  modal += '</div>'
  modal += '<div class="modal-footer">'
  modal += '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
  modal += '<button id="saveSettings" type="button" class="btn btn-primary">Save Settings</button>'
  modal += '</div></div></div></div>'
  $(document.body).append(modal)

  /* Set the default values of the preference boxes based on game variable */
  $('#talibriPlusSettings').click(() => {
    $('#chatpings').prop('checked', game.pref.chatpings)
    $('#sounds').prop('checked', game.pref.sounds)
  })

  $('#saveSettings').click(() => {
    game.pref.chatpings = $('#chatpings').is(':checked')
    game.pref.sounds = $('#sounds').is(':checked')
    saveUserPreferences()

    $('#talibriPlusModal').modal('hide')
  })

  /**
   * Market Tools
   */
  /* Add in 'Scrape' button only on the market page */
  if (window.location.pathname === '/trade/1') {
    $('span#your-leol').parent().parent().append('<button type="button" class="btn btn-primary pull-right" id="tPlusScrape" style="margin-top:0; margin-right:5px;">Update Data</button>')
  }

  $('#tPlusScrape').click(() => {
    const itemPages = ['material', 'raw-fish', 'food', 'herb', 'refined-material', 'ammunition', 'combat-potion', 'consumable-potion', 'finishing-material', 'gate']

    selectOrderType('sell')
    itemPages.forEach(checkPage)
  })

  let checkPage = (page) => {
    const validPages = [
      '/trade/1/get_listings?filter=material&order_type=sell',
      '/trade/1/get_listings?filter=raw-fish&order_type=sell',
      '/trade/1/get_listings?filter=food&order_type=sell',
      '/trade/1/get_listings?filter=herb&order_type=sell',
      '/trade/1/get_listings?filter=refined-material&order_type=sell',
      '/trade/1/get_listings?filter=ammunition&order_type=sell',
      '/trade/1/get_listings?filter=combat-potion&order_type=sell',
      '/trade/1/get_listings?filter=consumable-potion&order_type=sell',
      '/trade/1/get_listings?filter=finishing-material&order_type=sell',
      '/trade/1/get_listings?filter=gate&order_type=sell',
    ]

    selectOrderFilter(page)

    $(document).ajaxComplete((e, xhr, settings) => {
      validPages.forEach((validPage) => {
        if (settings.url === validPage) {
          scrapeItems($('#inventory-table').find('tbody').find('tr').toArray())
        }
      })
    })
  }

  const scrapeItems = (items) => {
    items.forEach((i) => {
      const id = $(i).attr('id').replace(/listing-/g, '')
      const item = $(i).find('td.name').text()
      const quantity = $(i).find($('td.quantity')).text().replace(/,/g, '')
      const cost = $(i).find($('td.cost')).text()
      const listing = [id, item, quantity, cost]
    })
  }

  /**
   * Utility functions to load, save, and start the script when loaded up
   */
  const loadUserPreferences = () => {
    const preferences = JSON.parse(localStorage.getItem('talibriplus'))
    game = preferences
  }

  const saveUserPreferences = () => {
    localStorage.setItem('talibriplus', JSON.stringify(game))
  }

  $(window).bind('beforeunload', () => {
    saveUserPreferences()
  })

  const updateSettings = () => {
    if (game.pref.chatpings === true) {
      listenForChatPings()
    }
  }

  const init = () => {
    loadUserPreferences()
    updateSettings()
  }

  init()
})
