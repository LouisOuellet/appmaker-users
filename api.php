<?php
class usersAPI extends CRUDAPI {

	public function get($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$get = parent::get($request, $data);
			if(isset($get['success'])){
				$categories = $this->Auth->query('SELECT * FROM `categories` WHERE `relationship` = ?','subscriptions')->fetchAll();
				if($categories != null){
					$categories = $categories->all();
					$get['output']['categories'] = $categories;
					$sub_categories = $this->Auth->query('SELECT * FROM `sub_categories` WHERE `relationship` = ?','subscriptions')->fetchAll();
					if($sub_categories != null){
						$sub_categories = $sub_categories->all();
						$get['output']['sub_categories'] = $sub_categories;
						$subscriptions = $this->Auth->query('SELECT * FROM `subscriptions` WHERE `relationship` = ? AND `link_to` = ?','users',$this->Auth->User['id'])->fetchAll();
						if($subscriptions != null){
							$subscriptions = $subscriptions->all();
							$get['output']['subscriptions'] = $subscriptions;
							return $get;
						} else {
							unset($get['success']);
							$get['error'] = $this->Language->Field["Unable to find subscriptions"];
							return $get;
						}
					} else {
						unset($get['success']);
						$get['error'] = $this->Language->Field["Unable to find subscriptions sub categories"];
						return $get;
					}
				} else {
					unset($get['success']);
					$get['error'] = $this->Language->Field["Unable to find subscriptions categories"];
					return $get;
				}
			} else {
				return $get;
			}
		}
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
						$this->Auth->delete('subscriptions',$subscription['id']);
						return [
							"success" => $this->Language->Field["User was unsubscribed"],
							"request" => $request,
							"data" => $data,
							"output" => [
								"subscription" => $subscription,
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
					$data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, array("cost" => 10));
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
