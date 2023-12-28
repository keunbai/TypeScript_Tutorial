       �       �!;o[��z   D : \ _ 4 _ W e b _ P r o g r a m m i n g \ _ Y o u T u b e r \ _ D a v e _ G r a y \ 4 _ R e a c t \ R e a c t _ T u t o r i a l s \ C o d e \ P a r t 3 _ [ P R J ]   B l o g \ 2 0 t u t _ R e a c t   C u s t o m   H o o k s \ s r c \ a p i                                                                                                                                                                                                                                                   [cbFunc1, cbFunc2, ...]
}

processed = [    // data 객체 내 user 속성 없을 시 미처리  (예재 기준)
  {
    eventName: 'login',
    data: {
      user: 'foo',
      name: 'bar',
      hasSession: 'true'
    }
  },
  {
    eventName: 'login',
    data: {
      name: 'cuz',
      hasSession: 'false'
    }
  },
  {
    eventName: 'logout',
    data: {
      user: 'foo',
      name: 'bar',      
    }
  },
  {
    eventName: 'logout',
    data: {
      user: 'cuz'
    }
  }
]
*/

class EventProcessor {
  filters = {};
  maps = {};
  processed = [];

  addFilter(eventName, filter) {
    this.filters[eventName] ||= [];
    this.filters[eventName].push(filter);
  }

  addMap(eventName, map) {
    this.maps[eventName] ||= [];
    this.maps[eventName].push(map);
  }

  handleEvent(eventName, data) {
    let allowEvent = true;
    
    for (const filter of this.filters[eventName] ?? []) {
      if (!filter(data)) {
        allowEvent = false;              //! 모든 filter들 모두 통과 필수
        break;
      }
    }

    if (allowEvent) {
      let mappedData = {...data};
      for (const map of this.maps[eventName] ?? []) {
        mappedData = map(mappedData);    //! 각 map 통과 시 data 객체 속성 추가됨
      }

      this.processed.push({
        eventName,
        data: mappedData
      });
    }
  }

  getProcessedEvents() {
    return this.processed;
  }
}

class UserEventProcessor extends EventProcessor {}


//
const uep = new UserEventProcessor();

uep.addFilter('login', ({ user }) => Boolean(user));
uep.addMap('login', (data) => ({
  ...data,
  hasSession: Boolean(data.user && data.name)
}));
uep.addFilter('logout', ({ user }) => Boolean(user));

//console.log(`${uep.filters.login}`);
//console.log(`${uep.maps.login}`);

uep.handleEvent('login', {    //! 'login' 이벤트 filter 통과 X
  name: 'jack'
});

uep.handleEvent('login', {    //! 'login' 이벤트 filter 통과 + map 의한 데이터 객체 속성 추가 
  user: 'tom',
  name: 'tomas'
});
uep.handleEvent('logout', {   //! 'logout' 이벤트 filtr 통과 + map 없음    
  user: 'tom'
});

uep.handleEvent('login', {    //! 'login' 이벤트 filter 통과 + map 의한 데이터 객체 속성 추가 X
  user: 'foo'
});
uep.handleEvent('logout', {   //! 'logout' 이벤트 filter 통과 X
  name: 'foobear'
});

console.log(uep.getProcessedEvents());

/*
[
  {
    eventName: 'login',
    data: { user: 'tom', name: 'tomas', hasSession: true }
  },
  { eventName: 'logout', data: { user: 'tom' } },
  { eventName: 'login', data: { user: 'foo', hasSession: false } }
]
*/