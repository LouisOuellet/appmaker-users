<?php
class usersAPI extends CRUDAPI {

	public function get($request = null, $data = null){
		if(isset($data)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$this->Auth->setLimit(0);
			// Load User
			$data['key'] = 'username';
			$get = parent::get('users', $data);
			if(!isset($get['output']['this']['dom']['name'])){ $get['output']['this']['dom']['name'] = ''; }
			if(isset($get['output']['this']['dom']['first_name'])){
				if(isset($get['output']['this']['dom']['name']) && $get['output']['this']['dom']['name'] != ''){ $get['output']['this']['dom']['name'] .= ' '; }
				$get['output']['this']['dom']['name'] .= $get['output']['this']['dom']['first_name'];
			}
			if(isset($get['output']['this']['dom']['middle_name'])){
				if(isset($get['output']['this']['dom']['name']) && $get['output']['this']['dom']['name'] != ''){ $get['output']['this']['dom']['name'] .= ' '; }
				$get['output']['this']['dom']['name'] .= $get['output']['this']['dom']['middle_name'];
			}
			if(isset($get['output']['this']['dom']['last_name'])){
				if(isset($get['output']['this']['dom']['name']) && $get['output']['this']['dom']['name'] != ''){ $get['output']['this']['dom']['name'] .= ' '; }
				$get['output']['this']['dom']['name'] .= $get['output']['this']['dom']['last_name'];
			}
			if(!isset($get['output']['this']['raw']['name'])){ $get['output']['this']['raw']['name'] = ''; }
			if(isset($get['output']['this']['raw']['first_name'])){
				if(isset($get['output']['this']['raw']['name']) && $get['output']['this']['raw']['name'] != ''){ $get['output']['this']['raw']['name'] .= ' '; }
				$get['output']['this']['raw']['name'] .= $get['output']['this']['raw']['first_name'];
			}
			if(isset($get['output']['this']['raw']['middle_name'])){
				if(isset($get['output']['this']['raw']['name']) && $get['output']['this']['raw']['name'] != ''){ $get['output']['this']['raw']['name'] .= ' '; }
				$get['output']['this']['raw']['name'] .= $get['output']['this']['raw']['middle_name'];
			}
			if(isset($get['output']['this']['raw']['last_name'])){
				if(isset($get['output']['this']['raw']['name']) && $get['output']['this']['raw']['name'] != ''){ $get['output']['this']['raw']['name'] .= ' '; }
				$get['output']['this']['raw']['name'] .= $get['output']['this']['raw']['last_name'];
			}
			// Build Relations
			$get = $this->buildRelations($get);
			return $get;
		}
	}

	public function read($request = null, $data = null){
		if(($data != null)||($data == null)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$users['raw'] = $this->Auth->query('SELECT * FROM `users` WHERE `isUser` = ?', 'true')->fetchAll();
			if($users['raw'] != null){
				$users['raw'] = $users['raw']->all();
				// Init Result
				foreach($users['raw'] as $key => $user){
					$users['dom'][$key] = $this->convertToDOM($user);
				}
				$headers = $this->Auth->getHeaders('users',true);
				foreach($headers as $key => $header){
					if(!$this->Auth->valid('field',$header,1,'users')){
						foreach($users['raw'] as $row => $values){
							unset($users['raw'][$row][$header]);
							unset($users['dom'][$row][$header]);
						}
						unset($headers[$key]);
					}
				}
				$results = [
					"success" => $this->Language->Field["This request was successfull"],
					"request" => $request,
					"data" => $data,
					"output" => [
						'headers' => $headers,
						'raw' => $users['raw'],
						'dom' => $users['dom'],
					],
				];
			} else {
				$results = [
					"error" => $this->Language->Field["Unable to complete the request"],
					"request" => $request,
					"data" => $data,
					"output" => [
						'raw' => $users['raw'],
					],
				];
			}
		} else {
			$results = [
				"error" => $this->Language->Field["Unable to complete the request"],
				"request" => $request,
				"data" => $data,
			];
		}
		return $results;
	}

	public function subscribe($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			if(!isset($data['user'])){ $data['user'] = $this->Auth->User['id']; }
			if(isset($data['category'],$data['sub_category'])){
				$exist = $this->Auth->query('SELECT * FROM `subscriptions` WHERE `category` = ? AND `sub_category` = ? AND `relationship` = ? AND `link_to` = ?',$data['category'],$data['sub_category'],'users',$data['user'])->fetchAll();
				if($exist != null){
					$subscriptions = $exist->all();
					if(empty($subscriptions)){
						$id = $this->Auth->create('subscriptions',[
							'category' => $data['category'],
							'sub_category' => $data['sub_category'],
							'relationship' => 'users',
							'link_to' => $data['user'],
						]);
						if($id != null){
							$subscription = $this->Auth->query('SELECT * FROM `subscriptions` WHERE `id` = ?',$id)->fetchAll();
							if($subscription != null){
								$subscription = $subscription->all();
								if(!empty($subscription)){
									return [
										"success" => $this->Language->Field["User was subscribed"],
										"request" => $request,
										"data" => $data,
										"output" => [
											"subscription" => $subscription[0],
										],
									];
								} else {
									return [
										"error" => $this->Language->Field["Unable to find the subscription"],
										"request" => $request,
										"data" => $data,
										"output" => [
											"subscription" => $subscription,
											"id" => $id,
										],
									];
								}
							} else {
								return [
									"error" => $this->Language->Field["User not subscribed"],
									"request" => $request,
									"data" => $data,
									"output" => [
										"subscription" => $subscription,
										"id" => $id,
									],
								];
							}
						} else {
							return [
								"error" => $this->Language->Field["An error occured during subscription"],
								"request" => $request,
								"data" => $data,
								"output" => [
									"id" => $id,
								],
							];
						}
					} else {
						return [
							"error" => $this->Language->Field["Already subscribed"],
							"request" => $request,
							"data" => $data,
							"output" => [
								"subscriptions" => $exist->all(),
							],
						];
					}
				} else {
					$id = $this->Auth->create('subscriptions',[
						'category' => $data['category'],
						'sub_category' => $data['sub_category'],
						'relationship' => 'users',
						'link_to' => $data['user'],
					]);
					return [
						"success" => $this->Language->Field["User was subscribed"],
						"request" => $request,
						"data" => $data,
						"output" => [
							"subscription" => $this->Auth->read('subscriptions',$id)->all()[0],
						],
					];
				}
			} else {
				return [
					"error" => $this->Language->Field["Unknown subscription"],
					"request" => $request,
					"data" => $data,
				];
			}
		}
	}

	public function unsubscribe($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			if(!isset($data['user'])){ $data['user'] = $this->Auth->User['id']; }
			if(isset($data['category'],$data['sub_category'])){
				$exist = $this->Auth->query('SELECT * FROM `subscriptions` WHERE `category` = ? AND `sub_category` = ? AND `relationship` = ? AND `link_to` = ?',$data['category'],$data['sub_category'],'users',$data['user'])->fetchAll();
				if($exist != null){
					$subscription = $exist->all();
					if(!empty($subscription)){
						$this->Auth->delete('subscriptions',$subscription[0]['id']);
						return [
							"success" => $this->Language->Field["User was unsubscribed"],
							"request" => $request,
							"data" => $data,
							"output" => [
								"subscription" => $subscription[0],
							],
						];
					} else {
						return [
							"error" => $this->Language->Field["Not subscribed"],
							"request" => $request,
							"data" => $data,
						];
					}
				} else {
					return [
						"error" => $this->Language->Field["Not subscribed"],
						"request" => $request,
						"data" => $data,
					];
				}
			} else {
				return [
					"error" => $this->Language->Field["Unknown subscription"],
					"request" => $request,
					"data" => $data,
				];
			}
		}
	}

	public function create($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			if((isset($data['password'],$data['password2']))&&($data['password'] == $data['password2'])){
				unset($data['password2']);
				// Validate password strength
				$uppercase = preg_match('@[A-Z]@', $data['password']);
				$lowercase = preg_match('@[a-z]@', $data['password']);
				$number    = preg_match('@[0-9]@', $data['password']);
				$specialChars = preg_match('@[^\w]@', $data['password']);
				if(!$uppercase || !$lowercase || !$number || !$specialChars || strlen($data['password']) > 8) {
					$data['password'] = base64_encode(urlencode(password_hash($data['password'], PASSWORD_BCRYPT, array("cost" => 10))));
					return parent::create($request, $data);
				} else {
					return [
						"error" => $this->Language->Field["Password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character"],
						"request" => $request,
						"data" => $data,
					];
				}
			} else {
				return [
					"error" => $this->Language->Field["Invalid password"],
					"request" => $request,
					"data" => $data,
				];
			}
		}
	}

	public function update($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			if((isset($data['password'],$data['password2']))&&($data['password'] == $data['password2'])&&($data['password'] != '')){
				unset($data['password2']);
				// Validate password strength
				$uppercase = preg_match('@[A-Z]@', $data['password']);
				$lowercase = preg_match('@[a-z]@', $data['password']);
				$number    = preg_match('@[0-9]@', $data['password']);
				$specialChars = preg_match('@[^\w]@', $data['password']);
				if(!$uppercase || !$lowercase || !$number || !$specialChars || strlen($data['password']) > 8) {
					$data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, array("cost" => 10));
					return parent::update($request, $data);
				} else {
					return [
						"error" => $this->Language->Field["Password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character"],
						"request" => $request,
						"data" => $data,
					];
				}
			} else {
				unset($data['password']);
				unset($data['password2']);
				return parent::update($request, $data);
			}
		}
	}
}
